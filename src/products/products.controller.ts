import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  Body,
  Inject,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NATS_SERVICE } from 'src/config';

export interface Product {
  name: string;
  price: number;
  available: boolean;
}

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await firstValueFrom<Product>(
        this.client.send({ cmd: 'create' }, createProductDto),
      );
      return product;
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }

  @Get()
  findAllProducts(@Query() pagination: PaginationDto) {
    return this.client.send({ cmd: 'find-all' }, pagination).pipe(
      catchError((error) => {
        throw new RpcException(error as Error);
      }),
    );
  }

  @Get(':id')
  async findOneProduct(@Param('id') id: string) {
    try {
      const product = await firstValueFrom<Product>(
        this.client.send({ cmd: 'find-one' }, { id }),
      );

      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.client.send({ cmd: 'remove' }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error as Error);
      }),
    );
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.client.send({ cmd: 'update' }, { id, ...body }).pipe(
      catchError((error) => {
        throw new RpcException(error as Error);
      }),
    );
  }
}
