
# Ecommerce API 🛒

Welcome to the **Ecommerce API**! This is a robust, scalable, and feature-rich backend solution designed to power modern e-commerce platforms. Built with **NestJS**, this API handles everything from user authentication and product management to order processing and payment integration. It also incorporates advanced technologies like **Redis**, **AWS S3**, **Stripe**, and more to ensure high performance, security, and reliability.

---

## Features ✨

### 1. **User Authentication & Management**
   - **Registration**: Users can register with email and password.
   - **Email Verification**: Users must verify their email to activate their account.
   - **Login/Logout**: Secure authentication using **JWT tokens**.
   - **Password Management**: Users can reset or update their passwords.
   - **Role-Based Access Control**: Admins and customers have different permissions.

### 2. **Product Management**
   - **Create/Update/Delete Products**: Admins can manage products.
   - **Product Search & Filtering**: Advanced search, filtering, and sorting capabilities.
   - **Image Upload**: Product images are stored in **AWS S3**.
   - **Caching**: Frequently accessed product data is cached using **Redis** for improved performance.

### 3. **Shopping Cart**
   - **Add/Remove Products**: Users can manage their cart.
   - **Cart Persistence**: Cart data is stored in the database for logged-in users.

### 4. **Order Processing**
   - **Place Orders**: Users can place orders with **cash-on-delivery** or **Stripe** payment integration.
     - **Mongoose Sessions**: Used to ensure atomicity during payment processing.
   - **Order Tracking**: Admins can update order status (e.g., Pending, Shipped, Delivered).
   - **Order History**: Users can view their past orders.

### 5. **Reviews & Ratings**
   - **Create/Update Reviews**: Customers can leave reviews for products they’ve purchased.
   - **Rating System**: Products are rated on a scale of 1 to 5.

### 6. **Advanced Features**
   - **Pagination, Sorting, and Filtering**: Applied across multiple endpoints for better data management.
   - **Image Handling**: Product images are uploaded and retrieved using **AWS S3**.
   - **Caching**: **Redis** is used to cache frequently accessed data, improving response times.
   - **Payment Integration**: **Stripe** is integrated for secure payment processing.
   - **Security**: **Helmet**, **CORS**, and **rate-limiting** are implemented to protect against common vulnerabilities.

---

## Technologies Used 🛠️

### Backend
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **MongoDB**: A NoSQL database for storing application data.
- **Redis**: Used for caching frequently accessed data to improve performance (works only on `localhost`).
- **AWS S3**: For storing and retrieving product images.
- **Stripe**: Integrated for secure payment processing.
- **Passport.js**: For authentication strategies (e.g., JWT).
- **Mongoose Sessions**: Used for atomic transactions during payment processing.

### Security
- **Helmet**: Adds security headers to protect against common web vulnerabilities.
- **CORS**: Ensures secure cross-origin resource sharing.
- **Rate Limiting**: Protects against brute-force attacks.

### Development Tools
- **Postman**: For testing and documenting API endpoints.
- **Git**: For version control.

---

## API Documentation 📚

The API is fully documented using **Postman**. You can access the interactive documentation here:

[![Postman Documentation](https://img.shields.io/badge/Postman-Documentation-orange)](https://documenter.getpostman.com/view/37533401/2sAYX9og5W)

---

## Installation & Setup 🛠️

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis (works only on `localhost`)
- AWS S3 bucket (for image storage)
- Stripe account (for payment processing)

### Steps
1. Clone the repository:
 ```bash
     git clone https://github.com/khaledGadelhaQ/ecommerce-api.git
  ```
2. Install dependencies:
  ```bash
   npm install
  ```
3. Set up environment variables:
Create a .env file in the root directory and add the following:
```bash
  PORT=3000
  MONGODB_URI=mongodb://localhost:27017/ecommerce
  JWT_SECRET=your_jwt_secret
  AWS_ACCESS_KEY_ID=your_aws_access_key
  AWS_SECRET_ACCESS_KEY=your_aws_secret_key
  AWS_BUCKET_NAME=your_bucket_name
  STRIPE_SECRET_KEY=your_stripe_secret_key
  REDIS_URL=redis://localhost:6379
```
4. Run the application:
  ```bash
    npm run start
  ```
---
## Future Plans and Updates 🚧

### 1. Wishlist Feature
  - **Allow users to save products to a wishlist for future purchase.**
  - **Enable notifications when wishlist items go on sale.**
    
### 2. Coupon System
 - **Implement a coupon/discount system for promotions.**
 - **Allow admins to create and manage coupons.**
 - **Apply coupons during checkout for discounts.**

### 3. Docker Integration
  - **Containerize the application using Docker for easier deployment and scalability.**
  - **Provide a Dockerfile and docker-compose.yml for local development and production.**

### 4. Testing
  - **Unit Testing: Write unit tests for individual components and services.**
  - **Integration Testing: Test the interaction between different modules.**
  - **End-to-End (E2E) Testing: Simulate real user scenarios to ensure the entire system works as expected.**

---

## Contributing 🤝
### Contributions are welcome! If you’d like to contribute, please follow these steps:
  1. **Fork the repository.**
  2. **Create a new branch for your feature or bugfix.**
  3. **Submit a pull request.**

---

[Project on Roadmap.sh](https://roadmap.sh/projects/ecommerce-api)
