import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class AddItemDto {

  @IsUUID()
  @IsOptional()
  cartId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
  
}
