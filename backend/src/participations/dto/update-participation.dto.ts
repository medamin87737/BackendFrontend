import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ParticipationStatus } from '../schemas/participation.schema';

export class UpdateParticipationDto {
  @IsEnum(ParticipationStatus)
  @IsOptional()
  status?: ParticipationStatus;

  @IsString()
  @IsOptional()
  justification?: string; // Obligatoire si status = DECLINED
}
