import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ClientSession, Model } from 'mongoose';
import { CartProductDTO } from './dto/cart-product.dto';
import { ProductService } from 'src/product/product.service';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class CartService extends BaseService<CartDocument> {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
  ) {
    super(cartModel);
  }

  /**
   * Calculates and updates the total cart price.
   */
  private calcTotalCartPrice(cart: CartDocument): number {
    cart.totalCartPrice = cart.cartItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
    cart.totalCartPriceAfterDiscount = undefined;
    return cart.totalCartPrice;
  }

  /**
   * Retrieves the user's cart.
   */
  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'cartItems.product',
      select: 'name price category',
    });

    if (!cart) {
      throw new NotFoundException(`No cart found for user ID: ${userId}`);
    }
    return cart;
  }

  /**
   * Adds a product to the cart or updates its quantity.
   */
  async addProduct(
    userId: string,
    cartProduct: CartProductDTO,
  ): Promise<CartDocument> {
    const { productID, quantity } = cartProduct;

    // Fetch product details from database
    const product = await this.productService.findOne(productID);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await this.cartModel.create({
        user: userId,
        cartItems: [{ product: productID, price: product.price, quantity }],
      });
    } else {
      const productIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productID,
      );

      if (productIndex === -1) {
        // Product is not in the cart, add new item
        cart.cartItems.push({
          product: productID,
          price: product.price,
          quantity,
        });
      } else {
        // Product exists, update quantity
        cart.cartItems[productIndex].quantity += quantity;
      }
    }

    this.calcTotalCartPrice(cart);
    await cart.save();

    return cart;
  }

  async deleteCart(userID: string): Promise<void> {
    await this.cartModel.findOneAndDelete({ user: userID });
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) throw new NotFoundException('Cart not found');

    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex == -1)
      throw new NotFoundException('Product is not added to the cart');

    if (quantity <= 0) {
      cart.cartItems.splice(productIndex, 1);
    } else {
      const item = cart.cartItems[productIndex];
      item.quantity = quantity;
      cart.cartItems[productIndex] = item;
    }

    this.calcTotalCartPrice(cart);
    await cart.save();

    return cart;
  }

  async removeProductFromCart(
    userId: string,
    productId: string,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOneAndUpdate(
      { user: userId },
      {
        $pull: { cartItems: { product: productId } },
      },
      { new: true },
    );

    if (!cart) throw new NotFoundException('Cart not found');

    this.calcTotalCartPrice(cart);
    await cart.save();

    return cart;
  }

  async clearCart(cartId: string, session?: ClientSession): Promise<void> {
    await this.cartModel.findByIdAndUpdate(
      { _id: cartId },
      {
        cartItems: [],
        totalCartPrice: 0,
        totalCartPriceAfterDiscount: undefined,
      },
      { session },
    );
  }
}
