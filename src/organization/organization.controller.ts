import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './model/organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createDto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.getOrganizationById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateOrganizationDto) {
    return this.organizationService.updateOrganization(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.deleteOrganization(id);
  }
}
