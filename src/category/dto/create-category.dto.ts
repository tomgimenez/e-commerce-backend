import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {

  @ApiProperty({
    description: 'Category name',
    nullable: false,
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
