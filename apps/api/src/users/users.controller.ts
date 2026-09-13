import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListUsersQueryDto, UpdateMyLocaleDto, UpdateUserAdminDto } from './dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: User) {
    return this.users.getById(user.id);
  }

  @Patch('me/locale')
  updateMyLocale(@CurrentUser() user: User, @Body() dto: UpdateMyLocaleDto) {
    return this.users.updateMyLocale(user.id, dto.preferredLocale);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  list(@Query() query: ListUsersQueryDto) {
    return this.users.list(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@CurrentUser() actor: User, @Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.users.updateAdmin(actor, id, dto);
  }
}
