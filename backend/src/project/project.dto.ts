import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My First Project', description: 'نام پروژه' })
  name: string;
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Updated Project', required: false })
  name?: string;
}
