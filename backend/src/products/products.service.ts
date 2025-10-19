import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    return {
      message: 'Products module is ready',
      data: [],
    };
  }
}
