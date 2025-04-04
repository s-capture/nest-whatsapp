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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InvitedUserDto } from 'src/user/model/user.dto';
import { Roles } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/role.guard';
import { InvitationService } from './invitation.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './model/organization.dto';
import { OrganizationRole } from './model/organization.enum';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly inviteService: InvitationService,
  ) {}

  @Post()
  @Roles(OrganizationRole.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req) {
    return this.organizationService.create(createOrganizationDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.organizationService.findOrganizationWithUsers(
      req.user.organizationId,
    );
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

  @Post('/invite')
  @Roles(OrganizationRole.ADMIN)
  inviteUser(@Body() inviteUserDto: InvitedUserDto, @Req() req) {
    console.group(req.user, 'req');
    return this.inviteService.inviteUser(
      inviteUserDto,
      req.user.organization.id,
    );
  }
}
