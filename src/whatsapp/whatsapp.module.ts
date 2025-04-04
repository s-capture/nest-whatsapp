import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/shared/common/aws-s3.service';
import { AwsS3Store } from 'src/shared/common/s3-store';
import { WhatsAppEntity } from './model/whatsapp.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsAppEntity])],
  controllers: [WhatsappController],
  providers: [AwsS3Service, AwsS3Store, WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
