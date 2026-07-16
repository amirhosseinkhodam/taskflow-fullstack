import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminChangeRoleDto {
  @ApiProperty({ example: 'admin', enum: ['user', 'admin'] })
  @IsIn(['user', 'admin'])
  readonly role: 'user' | 'admin' = 'user';
}

export class AdminChangePasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  readonly password: string = '';
}
