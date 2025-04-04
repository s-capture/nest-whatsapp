// dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { OrganizationRole } from 'src/organization/model/organization.enum';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  role: OrganizationRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  organization: OrganizationEntity;

  @Exclude()
  googleId: string;

  @Exclude()
  password: string;

  @Exclude()
  profielUrl: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
