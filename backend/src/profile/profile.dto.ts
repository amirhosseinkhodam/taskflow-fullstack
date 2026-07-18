import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly lastName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly nationalCode?: string;

  @ApiProperty({ example: '09123456789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly phone?: string;

  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly birthDate?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  readonly currentPassword: string = '';

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  readonly newPassword: string = '';
}
