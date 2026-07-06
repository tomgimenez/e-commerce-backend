import { IsEnum, IsInt, IsPositive, IsUUID } from "class-validator";
import { PaymentMethod } from "../entities/order.entity";

export class CreateOrderDto {
  @IsUUID()
  cart_id: string;

  @IsUUID()
  address_id: string;

  @IsInt()
  @IsPositive()
  shipping_method_id: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}