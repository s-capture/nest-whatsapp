import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { UserEntity } from 'src/user/model/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('authentication')
export class AuthEntity extends BaseEntity {
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToOne(() => UserEntity, (user) => user.auth, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  // Keep ManyToOne for Organization
  @ManyToOne(() => OrganizationEntity, (organization) => organization.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: OrganizationEntity;
}
