import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  readonly content: string = '';
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  readonly content?: string;
}
