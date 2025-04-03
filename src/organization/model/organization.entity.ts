import { AuthEntity } from 'src/auth/model/auth.entity';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('organization')
export class OrganizationEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  domain: string;

  @OneToMany(() => AuthEntity, (auth) => auth.organization)
  members: AuthEntity[];
}
