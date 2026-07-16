import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  @MaxLength(255)
  readonly email: string = '';

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  readonly password: string = '';

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly name: string = '';
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  readonly email: string = '';

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1)
  readonly password: string = '';
}
