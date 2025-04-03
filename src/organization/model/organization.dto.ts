import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  domain: string;
}

export class UpdateOrganizationDto {
  @IsString()
  name?: string;

  @IsString()
  domain?: string;
}
