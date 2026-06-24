import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sort_order?: number;
}