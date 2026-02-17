import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth/roles/roles.guard';
import { Roles } from '../auth/auth/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('HR', 'MANAGER', 'ADMIN')
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  @Get('my-notifications')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  findMyNotifications(@Request() req, @Query('unreadOnly') unreadOnly?: string) {
    const userId = req.user.userId;
    const unread = unreadOnly === 'true';
    return this.notificationsService.findByUser(userId, unread);
  }

  @Get('unread-count')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  countUnread(@Request() req) {
    const userId = req.user.userId;
    return this.notificationsService.countUnread(userId);
  }

  @Get(':id')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('user/all')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  removeAll(@Request() req) {
    const userId = req.user.userId;
    return this.notificationsService.removeAllForUser(userId);
  }
}
