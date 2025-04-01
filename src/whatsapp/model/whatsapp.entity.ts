import { Column, Entity, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base-entity/base.entity';

@Entity('whatsapp')
export class WhatsAppEntity extends BaseEntity {
  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ type: 'jsonb', nullable: true })
  authData: any; // Stores the authentication data for session persistence

  @Column({
    type: 'varchar',
    default: 'initializing',
  })
  status: string;

  @UpdateDateColumn()
  lastActivityAt: Date;
}
