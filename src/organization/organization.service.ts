import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../shared/auth/mail.service';
import { UserEntity } from '../user/model/user.entity';

import { UserService } from 'src/user/user.service';
import {
  CreateOrganizationDto,
  InviteUserDto,
  UpdateOrganizationDto,
} from './model/organization.dto';
import { OrganizationEntity } from './model/organization.entity';
import { OrganizationRole } from './model/organization.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private mailService: MailService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ): Promise<OrganizationEntity> {
    const organization = this.organizationRepository.create(
      createOrganizationDto,
    );
    await this.organizationRepository.save(organization);

    // Set the creator as admin
    await this.userService.setUserOrganization(
      userId,
      organization.id,
      OrganizationRole.ADMIN,
    );

    return organization;
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = await this.findOne(id);
    Object.assign(organization, updateOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }

  async inviteUser(
    organizationId: string,
    inviteUserDto: InviteUserDto,
    inviter: UserEntity,
  ): Promise<void> {
    const organization = await this.findOne(organizationId);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: inviteUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Send invitation email
    const invitationToken = 'generate-unique-token'; // Implement token generation
    await this.mailService.sendInvitationEmail(
      inviteUserDto.email,
      inviter.name,
      organization.name,
      inviteUserDto.role,
      `${process.env.FRONTEND_URL}/signup?token=${invitationToken}&organization=${organizationId}&role=${inviteUserDto.role}`,
    );
  }
}
