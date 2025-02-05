import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, connection, Model } from 'mongoose';
import { AddressDto } from './dto/address.dto';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Cart, CartDocument } from 'src/cart/schemas/cart.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { ProductModule } from 'src/product/product.module';
import { Connection } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { ProductService } from 'src/product/product.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  private stripe: Stripe;
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
  ) {
    super(orderModel);
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

  async validateCartItems(
    cartId: string,
    session?: ClientSession,
  ): Promise<CartDocument> {
    // 1) Get the cart inside the session
    const cart = await this.cartService.findOne({ _id: cartId }, session);
    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty!');
    }
    // 2) Validate prices and stock
    for (const item of cart.cartItems) {
      const product = await this.productService.findOne(
        { _id: item.product },
        session,
      );
      if (item.price !== product.price) {
        throw new BadRequestException(`Price of ${product.name} has changed`);
      }
      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Not enought stock for ${product.name}`);
      }
    }
    // 3) return the cart after the validation
    return cart;
  }

  async decreaseProductStock(cart: CartDocument, session?: ClientSession) {
    // 4) upatet product stock inside the session
    await this.productService.bulkUpdateStock(
      cart.cartItems.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      })),
    );
    // 5) clear the cart inside the session
    await this.cartService.clearCart(cart.id, session);
  }

  async createCashOrder(
    cartId: string,
    address: AddressDto,
  ): Promise<OrderDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const cart = await this.validateCartItems(cartId, session);
      // 3) create the order inside the session
      const order = await this.orderModel.create(
        [
          {
            user: cart.user,
            items: cart.cartItems,
            totalOrderPrice: cart.totalCartPrice,
            paymentMethod: PaymentMethod.CASH,
            shippingAddress: address,
            orderStatus: OrderStatus.CONFIRMED,
            isPaid: false,
          },
        ],
        { session },
      );

      await this.decreaseProductStock(cart, session);
      // 6) commit transaction
      await session.commitTransaction();
      session.endSession();

      // 7) return ordre document
      return order[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async createCheckoutSession(cartId: string, address: AddressDto) {
    const cart = await this.validateCartItems(cartId);

    let lineItems = [];
    for (const item of cart.cartItems) {
      const product = await this.productService.findOne({ _id: item.product });

      const stripeProduct = await this.stripe.products.create({
        name: product.name,
        description: product.description,
      });

      const price = await this.stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(Number(product.price) * 100),
        product_data: { name: stripeProduct.name },
      });

      lineItems.push({
        price: price.id,
        quantity: item.quantity,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/cancel`,
      line_items: lineItems,
      metadata: {
        cartId: cart.id,
        address: JSON.stringify(address),
      },
    });

    return { sessionUrl: session.url };
  }

  async webhookCheckout(req, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.createCardOrder(session);
    }
  }

  private async createCardOrder(session: Stripe.Checkout.Session) {
    const sessionMetadata = session.metadata;
    if (!sessionMetadata)
      throw new BadRequestException('Missing session metadata');

    const cartId = sessionMetadata.cartId;
    const address = sessionMetadata.address;

    const cart = await this.cartService.findOne({ _id: cartId });
    if (!cart) throw new BadRequestException('Cart not found');

    // Verify amount paid matches stored metadata
    if (session.amount_total !== cart.totalCartPrice * 100) {
      throw new BadRequestException(
        'Payment amount mismatch! Possible price manipulation.',
      );
    }

    // Start a session for atomic transactions
    const sessionDb = await this.connection.startSession();
    sessionDb.startTransaction();

    try {
      // Create the order
      const order = await this.orderModel.create(
        [
          {
            user: cart.user,
            items: cart.cartItems,
            totalOrderPrice: cart.totalCartPrice,
            paymentMethod: PaymentMethod.CARD,
            shippingAddress: address,
            orderStatus: OrderStatus.CONFIRMED,
            isPaid: true,
          },
        ],
        { sessionDb },
      );

      this.decreaseProductStock(cart, sessionDb);

      await sessionDb.commitTransaction();
      sessionDb.endSession();
    } catch (error) {
      await sessionDb.abortTransaction();
      sessionDb.endSession();
      throw error;
    }
  }
}
