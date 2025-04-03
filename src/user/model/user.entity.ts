import { AuthEntity } from 'src/auth/model/auth.entity';
import { Role } from 'src/auth/model/auth.enum';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.ADMIN })
  role: Role;

  @OneToOne(() => AuthEntity)
  auth: AuthEntity;
}
