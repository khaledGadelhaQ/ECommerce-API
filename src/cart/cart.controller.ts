import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { CartProductDTO } from './dto/cart-product.dto';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';

@Controller('cart')
@Roles(Role.Customer)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCart(@Req() req) {
    const cart = await this.cartService.getCart(req.user.id);
    return {
      status: 'success',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async addProduct(@Req() req, @Body() cartProduct: CartProductDTO) {
    const cart = await this.cartService.addProduct(req.user.id, cartProduct);
    return {
      status: 'success',
      message: 'Product added to cart successfully!',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@Req() req) {
    await this.cartService.deleteCart(req.user.id);
    return;
  }

  @Patch('/:productId')
  @HttpCode(HttpStatus.OK)
  async updateQuantity(
    @Req() req,
    @Param('productId', ValidateObjectIdPipe) productId: string,
    @Body('quantity') quantity: number,
  ) {
    const cart = await this.cartService.updateItemQuantity(
      req.user.id,
      productId,
      quantity,
    );
    return {
      status: 'success',
      message: 'Product quantity updated successfully',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  @Delete('/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProduct(
    @Req() req,
    @Param('productId', ValidateObjectIdPipe) productId: string,
  ) {
    await this.cartService.removeProductFromCart(req.user.id, productId);
  }
}
