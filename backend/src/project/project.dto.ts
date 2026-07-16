import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'My First Project', description: 'نام پروژه' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly name: string = '';
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Updated Project', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly name?: string;
}
