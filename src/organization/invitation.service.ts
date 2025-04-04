// src/organization/services/invitation.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { InvitedAcceptUserDto, InvitedUserDto } from 'src/user/model/user.dto';
import { UserEntity } from 'src/user/model/user.entity';
import { emailStatus } from 'src/user/model/user.enum';
import { MailService } from '../shared/auth/mail.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async inviteUser(inviteDto: InvitedUserDto, organizationId: string) {
    // Check if user already exists
    console.log(inviteDto, organizationId);
    try {
      let user = await this.userRepository.findOne({
        where: { email: inviteDto.email },
      });

      // Check if organization exists
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Generate invitation token
      const token = this.jwtService.sign(
        {
          email: inviteDto.email,
          organizationId: organizationId,
          role: inviteDto.role,
        },
        { secret: this.configService.get('JWT_SECRET'), expiresIn: '7d' },
      );
      console.log(token);
      // Create or update user
      if (!user) {
        user = this.userRepository.create({
          email: inviteDto.email,
          name: inviteDto.name,
          status: emailStatus.INVITE_PENDING,
          organization,
          invitationToken: token,
          role: inviteDto.role,
        });
      } else {
        user.status = emailStatus.INVITE_PENDING;
        user.organization = organization;
        user.role = inviteDto.role;
      }

      await this.userRepository.save(user);

      // Send invitation email
      const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

      await this.mailService.sendInvitationEmail(
        inviteDto.email,
        inviteDto.name,
        organization.name,
        inviteDto.role,
        inviteUrl,
      );

      return { success: true };
    } catch (error) {
      return new Error(error);
    }
  }

  async acceptInvitation(acceptDto: InvitedAcceptUserDto) {
    // Verify token
    let payload;
    try {
      payload = this.jwtService.verify(acceptDto.invitationToken);
    } catch (e) {
      throw new Error('Invalid or expired token');
    }

    // Check if token matches the request
    if (
      payload.email !== acceptDto.email ||
      payload.organizationId !== acceptDto.organizationId
    ) {
      throw new Error('Invalid invitation');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { email: acceptDto.email },
      relations: ['organization'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user
    user.name = acceptDto.name;
    user.password = acceptDto.password; // Make sure to hash this in production
    user.status = emailStatus.ACTIVE;
    user.role = acceptDto.role;

    await this.userRepository.save(user);

    return user;
  }
}
