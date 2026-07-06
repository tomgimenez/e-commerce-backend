import { Body, Controller, Headers, Post } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Auth } from "src/auth/decorators";
import { GetUser } from "src/user/decorators/get-user.decorator";
import { User } from "src/user/entities/user.entity";

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth()
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.orderService.create(createOrderDto, user);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any, @Headers() headers: any) {
    return this.orderService.handleWebhook(body, headers);
  }
}