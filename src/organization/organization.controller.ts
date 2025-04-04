import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/role.guard';
import {
  CreateOrganizationDto,
  InviteUserDto,
  UpdateOrganizationDto,
} from './model/organization.dto';
import { OrganizationRole } from './model/organization.enum';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@ApiTags('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req) {
    return this.organizationService.create(createOrganizationDto, req.user.id);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN)
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(OrganizationRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }

  @Post(':id/invite')
  @Roles(OrganizationRole.ADMIN)
  inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req,
  ) {
    return this.organizationService.inviteUser(id, inviteUserDto, req.user);
  }
}
