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
} from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { JwtAuthGuard } from '../auth/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth/roles/roles.guard';
import { Roles } from '../auth/auth/roles.decorator';

@Controller('participations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Post()
  @Roles('MANAGER', 'HR')
  create(@Body() createDto: CreateParticipationDto) {
    return this.participationsService.create(createDto);
  }

  @Get()
  @Roles('HR', 'MANAGER')
  findAll() {
    return this.participationsService.findAll();
  }

  @Get('activity/:activityId')
  @Roles('HR', 'MANAGER')
  findByActivity(@Param('activityId') activityId: string) {
    return this.participationsService.findByActivity(activityId);
  }

  @Get('employee/:employeeId')
  @Roles('HR', 'MANAGER', 'EMPLOYEE')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.participationsService.findByEmployee(employeeId);
  }

  @Get('my-participations')
  @Roles('EMPLOYEE')
  findMyParticipations(@Request() req) {
    const employeeId = req.user.userId;
    return this.participationsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles('HR', 'MANAGER', 'EMPLOYEE')
  findOne(@Param('id') id: string) {
    return this.participationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('EMPLOYEE', 'MANAGER', 'HR')
  update(@Param('id') id: string, @Body() updateDto: UpdateParticipationDto) {
    return this.participationsService.update(id, updateDto);
  }

  @Patch(':id/accept')
  @Roles('EMPLOYEE')
  accept(@Param('id') id: string) {
    return this.participationsService.acceptParticipation(id);
  }

  @Patch(':id/decline')
  @Roles('EMPLOYEE')
  decline(@Param('id') id: string, @Body('justification') justification: string) {
    return this.participationsService.declineParticipation(id, justification);
  }

  @Delete(':id')
  @Roles('HR', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.participationsService.remove(id);
  }
}
