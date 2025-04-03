import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import {
  CompleteRegistrationDto,
  InviteStaffDto,
  LoginDto,
  RegisterDto,
} from './model/auth.dto';
import { AuthEntity } from './model/auth.entity';
import { Role } from './model/auth.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, organizationName, firstName, lastName } =
      registerDto;

    // Check if email already exists
    const existingAuth = await this.authRepository.findOne({
      where: { email },
    });
    if (existingAuth) {
      throw new ConflictException('Email already in use');
    }

    // Create organization
    const organization = await this.organizationService.createOrganization({
      name: organizationName,
      domain: `${organizationName}.com`,
    });

    // Create user
    const user = await this.userService.createUser({
      firstName,
      lastName,
      role: Role.ADMIN,
      isVerified: true,
    });

    // Create auth
    const auth = new AuthEntity();
    auth.email = email;
    auth.user = user;
    auth.organization = organization;

    if (password) {
      auth.passwordHash = await bcrypt.hash(password, 10);
    }

    await this.authRepository.save(auth);

    const tokens = await this.generateTokens(auth);
    await this.updateRefreshToken(auth.id, tokens.refreshToken);

    return { ...tokens, user };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const auth = await this.authRepository.findOne({
      where: { email },
      relations: ['user', 'organization'],
    });

    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (password && !(await bcrypt.compare(password, auth.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(auth);
    await this.updateRefreshToken(auth.id, tokens.refreshToken);

    return { ...tokens, user: auth.user };
  }

  async inviteStaff(inviterAuth: AuthEntity, inviteStaffDto: InviteStaffDto) {
    const { email, role } = inviteStaffDto;

    // Check if email already exists in the organization
    const existingAuth = await this.authRepository.findOne({
      where: { email, organization: { id: inviterAuth.organization.id } },
    });

    if (existingAuth) {
      throw new ConflictException('User already exists in this organization');
    }

    // Create invitation token
    const token = this.jwtService.sign(
      { email, organizationId: inviterAuth.organization.id, role },
      { expiresIn: '7d' },
    );

    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL}/register?token=${token}`;
    await this.mailService.sendInvitationEmail(email, inviteLink);

    return { message: 'Invitation sent successfully' };
  }

  async completeRegistration(completeRegistrationDto: CompleteRegistrationDto) {
    const { token, password, firstName, lastName } = completeRegistrationDto;

    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { email, organizationId, role } = payload;

    // Check if user already exists
    const existingAuth = await this.authRepository.findOne({
      where: { email, organization: { id: organizationId } },
    });

    if (existingAuth) {
      throw new ConflictException('User already registered');
    }

    // Create user
    const user = await this.userService.createUser({
      firstName,
      lastName,
      role,
      isVerified: true,
    });

    // Get organization
    const organization =
      await this.organizationService.getOrganizationById(organizationId);

    // Create auth
    const auth = new AuthEntity();
    auth.email = email;
    auth.passwordHash = await bcrypt.hash(password, 10);
    auth.user = user;
    auth.organization = organization;

    await this.authRepository.save(auth);

    const tokens = await this.generateTokens(auth);
    await this.updateRefreshToken(auth.id, tokens.refreshToken);

    return { ...tokens, user };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName, googleId } = req.user;

    // Check if user exists with this googleId
    let auth = await this.authRepository.findOne({
      where: { googleId },
      relations: ['user', 'organization'],
    });

    if (!auth) {
      // Check if email exists (user might have registered with email first)
      auth = await this.authRepository.findOne({
        where: { email },
        relations: ['user', 'organization'],
      });

      if (auth) {
        // User exists but registered with email, add googleId
        auth.googleId = googleId;
        await this.authRepository.save(auth);
      } else {
        // New user - create organization with domain from email
        const domain = email.split('@')[1];
        const organization =
          await this.organizationService.createOrganization(domain);

        // Create user
        const user = await this.userService.createUser({
          firstName,
          lastName,
          role: Role.ADMIN,
          isVerified: true,
        });

        // Create auth
        auth = new AuthEntity();
        auth.email = email;
        auth.googleId = googleId;
        auth.user = user;
        auth.organization = organization;

        await this.authRepository.save(auth);
      }
    }

    const tokens = await this.generateTokens(auth);
    await this.updateRefreshToken(auth.id, tokens.refreshToken);

    return { ...tokens, user: auth.user };
  }

  async refreshTokens(authId: string, refreshToken: string) {
    const auth = await this.authRepository.findOne({
      where: { id: authId },
      relations: ['user', 'organization'],
    });

    if (!auth || !auth.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      auth.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(auth);
    await this.updateRefreshToken(auth.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(auth: AuthEntity) {
    const payload = {
      authId: auth.id,
      userId: auth.user.id,
      organizationId: auth.organization.id,
      role: auth.user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  private async updateRefreshToken(authId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.authRepository.update(authId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async validateAuth(authId: string) {
    return this.authRepository.findOne({
      where: { id: authId },
      relations: ['user', 'organization'],
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthEntity | null> {
    const auth = await this.authRepository.findOne({
      where: { email },
      relations: ['user', 'organization'],
    });

    if (!auth) {
      return null;
    }

    if (password && !(await bcrypt.compare(password, auth.passwordHash))) {
      return null;
    }

    return auth;
  }
}
