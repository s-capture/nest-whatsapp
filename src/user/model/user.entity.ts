import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './user.enum';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  profielUrl: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.ADMIN })
  role: Role;

  // Keep ManyToOne for Organization
  @ManyToOne(() => OrganizationEntity, (organization) => organization.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: OrganizationEntity;
}
