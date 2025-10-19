import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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
        '- "핸드폰" → 동의어 "휴대폰", "스마트폰"도 함께 검색',
    )
    .setVersion('1.0.0')
    .setContact('Jax Moon', 'https://github.com/jaxmoon', 'jax@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('http://localhost:4000/api', 'Local API')
    .addTag('products', '상품 관리 API')
    .addTag('search', '상품 검색 API')
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
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
