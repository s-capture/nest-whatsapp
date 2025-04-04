import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { OrganizationRole } from '../organization/model/organization.enum';
import { OrganizationService } from '../organization/organization.service';
import {
  createFromOAuthDto,
  CreateUserDto,
  OAuthUpdateDto,
  UpdateUserDto,
} from './model/user.dto';
import { UserEntity } from './model/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private organizationService: OrganizationService,
  ) {}

  async createFromOAuth(createFromOAuthDto: createFromOAuthDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createFromOAuthDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createFromOAuthDto.password, 10);
    const user = this.userRepository.create({
      ...createFromOAuthDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async updateGoogleId(id, OAuthUpdateDto: OAuthUpdateDto) {
    const user = await this.findById(id);

    Object.assign(user, OAuthUpdateDto);
    return this.userRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async setUserOrganization(
    userId: string,
    organizationId: string,
    role: OrganizationRole,
  ): Promise<void> {
    const user = await this.findById(userId);
    const organization = await this.organizationService.findOne(organizationId);

    user.organization = organization;
    user.role = role;

    await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({ relations: ['organization'] });
  }
}
