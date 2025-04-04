import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { UserEntity } from 'src/user/model/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('organization')
export class OrganizationEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  domain: string;

  @OneToMany(() => UserEntity, (user) => user.organization)
  members: UserEntity[];
}
