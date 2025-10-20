import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration - environment-based security
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) in development
      if (!origin && !isProduction) {
        callback(null, true);
        return;
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600, // Preflight cache duration (1 hour)
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('한국어 상품 검색 API')
    .setDescription(
      'Elasticsearch Nori 플러그인을 활용한 한국어 형태소 분석 기반 상품 검색 API\n\n' +
        '## 주요 기능\n' +
        '- 한국어 형태소 분석 기반 전문 검색\n' +
        '- 상품명, 상품설명 멀티필드 검색\n' +
        '- 카테고리, 가격, 태그 필터링\n' +
        '- 정렬 및 페이지네이션\n' +
        '- 검색어 하이라이팅\n\n' +
        '## 검색 예제\n' +
        '- "무선이어폰" → "무선", "이어폰"으로 분해되어 검색\n' +
        '- "노트북을" → 조사 "을" 제거되고 "노트북"으로 검색\n' +
        '- "핸드폰" → 동의어 "휴대폰", "스마트폰"도 함께 검색\n\n' +
        '## Admin API 인증\n' +
        '- POST /admin/auth/login으로 JWT 토큰 발급\n' +
        '- 우측 상단 Authorize 버튼 클릭하여 토큰 입력\n' +
        '- 형식: Bearer {your-token}',
    )
    .setVersion('1.0.0')
    .setContact('Jax Moon', 'https://github.com/jaxmoon', 'jax@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('http://localhost:4000/api', 'Local API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요 (POST /admin/auth/login에서 발급)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Admin Authentication', '관리자 인증 API')
    .addTag('products', '상품 관리 API')
    .addTag('search', '상품 검색 API')
    .addTag('synonyms', '유의어 관리 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Search UI: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
