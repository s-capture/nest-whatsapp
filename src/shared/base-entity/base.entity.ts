import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  @Generated('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
