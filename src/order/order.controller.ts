import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { OrderService } from './order.service';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderDocument } from './schemas/order.schema';
import { AddressDto } from './dto/address.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllOrders(@Req() req, @Query() query: any) {
    // only get the logged in customer orders.
    // if the logged user is admin => return all orders
    let filterObject = {};
    if (req.user.role === 'customer') {
      filterObject = {
        user: req.user.id,
      };
    }
    const orders = await this.orderService.findAll(query, filterObject);
    return {
      status: 'success',
      numOfOrders: orders.results,
      data: orders.data,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const order = await this.orderService.findOne({ _id: id });
    console.log(order);
    return {
      status: 'success',
      data: order,
    };
  }

  @Patch('/:id/status')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body('status') newStatus: OrderStatus,
  ) {
    // Prepare the update object
    const updateData: Partial<OrderDocument> = { orderStatus: newStatus };

    // If the order is delivered, set `isPaid` to true
    if (newStatus === OrderStatus.DELIVERED) {
      updateData.isPaid = true;
      updateData.deliveredAt = new Date();
    }

    // Update the order
    const order = await this.orderService.update(id, updateData);

    return {
      status: 'success',
      message: 'Order updated successfully',
      data: order,
    };
  }

  @Post('/:cartId/cod')
  @Roles(Role.Customer)
  @HttpCode(HttpStatus.CREATED)
  async createCashOrder(
    @Param('cartId', ValidateObjectIdPipe) cartId: string,
    @Body() address: AddressDto,
  ) {
    const order = await this.orderService.createCashOrder(cartId, address);
    return {
      status: 'success',
      message: 'Your order has been confirmed and will be shipped soon!',
      data: order,
    };
  }

  @Post('/checkout-session/:cartId')
  @Roles(Role.Customer)
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Param('cartId', ValidateObjectIdPipe) cartId: string,
    @Body() address: AddressDto,
  ) {
    return this.orderService.createCheckoutSession(cartId, address);
  }

  @Post('/webhook-checkout')
  async webhookCheckout(@Req() req, @Headers('stripe-signature') signature: string) {
    return this.orderService.webhookCheckout(req, signature);
  }
}
