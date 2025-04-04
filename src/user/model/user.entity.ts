import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { OrganizationRole } from 'src/organization/model/organization.enum';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

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
  refreshToken: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  profielUrl: boolean;

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
