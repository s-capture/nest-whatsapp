import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './model/organization.dto';
import { OrganizationEntity } from './model/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async createOrganization(
    createDto: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = this.organizationRepository.create(createDto);
    return this.organizationRepository.save(organization);
  }

  async getOrganizationById(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async updateOrganization(
    id: string,
    updateDto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = await this.getOrganizationById(id);
    return this.organizationRepository.save({ ...organization, ...updateDto });
  }

  async deleteOrganization(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}
