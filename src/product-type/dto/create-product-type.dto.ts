import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateProductTypeDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsObject()
  @IsNotEmpty()
  schema: Record<string, any>;
}