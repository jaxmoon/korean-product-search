import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [AdminProductsController],
})
export class AdminProductsModule {}
