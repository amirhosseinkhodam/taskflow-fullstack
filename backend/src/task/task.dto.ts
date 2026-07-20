import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login page' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly title: string = '';

  @ApiProperty({ example: 'Build the login UI', required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  readonly projectId: number = 0;

  @ApiProperty({
    example: 'user@example.com',
    required: false,
    description: 'Admin-only: assign task to user by email',
  })
  @IsOptional()
  @IsEmail()
  readonly assigneeEmail?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ example: 'Updated title', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    example: 'done',
    required: false,
    enum: ['pending', 'in-progress', 'done'],
  })
  @IsOptional()
  @IsIn(['pending', 'in-progress', 'done'])
  readonly status?: string;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Admin-only: move task to another project',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly projectId?: number;

  @ApiProperty({
    example: 'user@example.com',
    required: false,
    description: 'Admin-only: reassign task to user by email',
  })
  @IsOptional()
  @IsEmail()
  readonly assigneeEmail?: string;
}

export class ReorderTaskDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Ordered array of task IDs' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly taskIds: number[] = [];
}
