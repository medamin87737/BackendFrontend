import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ConfirmParticipantsDto } from './dto/confirm-participants.dto';
import { JwtAuthGuard } from '../auth/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth/roles/roles.guard';
import { Roles } from '../auth/auth/roles.decorator';
import { ActivityStatus } from './schemas/activity.schema';

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles('HR')
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto);
  }

  @Get()
  @Roles('HR', 'MANAGER', 'ADMIN')
  async findAll() {
    return this.activitiesService.findAll();
  }

  @Get('my-activities')
  @Roles('MANAGER')
  async findMyActivities(@Request() req) {
    // Le JWT strategy retourne { userId: payload.sub, role: payload.role }
    const managerId = req.user.userId || req.user.sub;
    console.log('🔍 Controller - req.user:', req.user);
    console.log('🔍 Controller - managerId:', managerId);
    return this.activitiesService.findByManager(managerId);
  }

  @Get('pending')
  @Roles('MANAGER')
  async findPendingActivities(@Request() req) {
    const managerId = req.user.userId || req.user.sub;
    return this.activitiesService.findPendingForManager(managerId);
  }

  @Get('status/:status')
  @Roles('HR', 'MANAGER', 'ADMIN')
  async findByStatus(@Param('status') status: ActivityStatus) {
    return this.activitiesService.findByStatus(status);
  }

  @Get('department/:departmentId')
  @Roles('HR', 'MANAGER', 'ADMIN')
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.activitiesService.findByDepartment(departmentId);
  }

  @Get(':id')
  @Roles('HR', 'MANAGER', 'EMPLOYEE', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Put(':id')
  @Roles('HR', 'ADMIN')
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Patch(':id/forward')
  @Roles('HR')
  async forwardToManager(@Param('id') id: string, @Body('managerId') managerId: string) {
    return this.activitiesService.forwardToManager(id, managerId);
  }

  @Patch(':id/status')
  @Roles('HR', 'MANAGER', 'ADMIN')
  async updateStatus(@Param('id') id: string, @Body('status') status: ActivityStatus) {
    return this.activitiesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
