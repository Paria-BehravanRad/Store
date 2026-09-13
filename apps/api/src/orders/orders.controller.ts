import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto, ListOrdersQueryDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @Get('orders')
  listMine(@CurrentUser() user: User, @Query() query: ListOrdersQueryDto) {
    return this.orders.listMine(user.id, query);
  }

  @Get('orders/:id')
  getMine(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orders.getMine(user.id, id);
  }

  @Post('orders/:id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orders.cancelMine(user.id, id);
  }

  @Get('admin/orders')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  listAdmin(@Query() query: ListOrdersQueryDto) {
    return this.orders.listAdmin(query);
  }

  @Get('admin/orders/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAdmin(@Param('id') id: string) {
    return this.orders.getAdmin(id);
  }

  @Patch('admin/orders/:id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateStatus(
    @CurrentUser() actor: User,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatus(actor, id, dto);
  }
}
