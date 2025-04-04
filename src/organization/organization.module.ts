// organization/organization.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserModule } from '../user/user.module';
import { InvitationService } from './invitation.service';
import { OrganizationEntity } from './model/organization.entity';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, InvitationService],
  exports: [OrganizationService, InvitationService],
})
export class OrganizationModule {}
