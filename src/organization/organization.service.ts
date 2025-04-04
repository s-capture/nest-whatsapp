import {
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

  async findOrganizationWithUsers(organizationId: string) {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: ['members'],
    });

    return organization;
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
}
