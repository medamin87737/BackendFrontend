import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { Participation, ParticipationSchema } from './schemas/participation.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participation.name, schema: ParticipationSchema },
    ]),
    AuthModule,
  ],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
