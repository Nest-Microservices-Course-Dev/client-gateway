import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NATS_SERVICE } from 'src/config';

export interface Order {
  totalAmount: string;
  totalItems: number;
}

@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  //* Create
  //* Metodo para crear un nuevo pedido
  /**
   * @param createOrderDto
   * @returns
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send({ cmd: 'createOrder' }, createOrderDto).pipe(
      catchError((err) => {
        throw new RpcException(err as Error);
      }),
    );
  }

  //* Find
  //* Metodo para encontrar todos los pedidos
  /**
   * @param orderPaginationDto
   * @returns
   */

  @Get()
  async findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom<Order[]>(
        this.client.send({ cmd: 'findAllOrders' }, orderPaginationDto),
      );
      return orders;
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }

  //* FindOne
  //* Metodo para encontrar un pedido específico por su ID
  /**
   * @param id
   * @returns
   */
  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom<Order>(
        this.client.send('findOneOrder', { id }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }

  //* FindByStatus
  //* Metodo para encontrar todos los pedidos con un estado específico
  /**
   * @param statusDto
   * @param pagination
   * @returns
   */
  @Get(':status')
  findByStatus(
    @Param() statusDto: StatusDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      return this.client.send(
        { cmd: 'findAllOrders' },
        {
          ...pagination,
          status: statusDto.status,
        },
      );
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }

  //* UpdateStatus
  //* Metodo para actualizar el estado de un pedido
  /**
   * @param id
   * @param statusDto
   * @returns
   */
  @Patch(':id')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      return this.client.send(
        { cmd: 'updateOrderStatus' },
        { id, status: statusDto.status },
      );
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }
}
