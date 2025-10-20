import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { SynonymsModule } from './synonyms/synonyms.module';
import { AuthModule } from './auth/auth.module';
import { AdminSynonymsModule } from './admin-synonyms/admin-synonyms.module';
import { AdminProductsModule } from './admin-products/admin-products.module';
import { AdminIndexesModule } from './admin-indexes/admin-indexes.module';
import { AdminStatsModule } from './admin-stats/admin-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ProductsModule,
    SynonymsModule,
    AdminSynonymsModule,
    AdminProductsModule,
    AdminIndexesModule,
    AdminStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
