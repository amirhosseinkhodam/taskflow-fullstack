import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  readonly email?: string;

  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  readonly currentPassword: string = '';
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
