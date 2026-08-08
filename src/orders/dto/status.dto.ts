import { IsOptional } from 'class-validator';
import { OrderStatus, OrderStatusList } from '../enum/order.enum';
import { IsEnum } from 'class-validator';

export class StatusDto {
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `Status must be one of the enum values: ${OrderStatusList.join(', ')}`,
  })
  status: OrderStatus;
}
