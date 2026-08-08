import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderStatus, OrderStatusList } from '../enum/order.enum';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message:
      'Status must be one of the following: ' +
      Object.values(OrderStatusList).join(', '),
  })
  status: OrderStatus;
}
