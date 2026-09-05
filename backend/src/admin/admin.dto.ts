import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_ROLES } from '@shared/const/user-roles';

export class AdminChangeRoleDto {
  @ApiProperty({ example: 'admin', enum: ['user', 'admin'] })
  @IsIn([USER_ROLES.USER, USER_ROLES.ADMIN])
  readonly role: 'user' | 'admin' = USER_ROLES.USER;
}

export class AdminChangePasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  readonly password: string = '';
}
