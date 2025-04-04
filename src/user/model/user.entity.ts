import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { OrganizationRole } from 'src/organization/model/organization.enum';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { emailStatus } from './user.enum';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: emailStatus,
    default: emailStatus.ACTIVE,
  })
  status: emailStatus;

  @Column({ nullable: true })
  invitationToken: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.ADMIN,
  })
  role: OrganizationRole;

  // Keep ManyToOne for Organization
  @ManyToOne(() => OrganizationEntity, (organization) => organization.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: OrganizationEntity;
}
