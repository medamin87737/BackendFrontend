import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateParticipationDto {
  @IsMongoId()
  activityId: string;

  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  confirmedBy: string; // Manager qui confirme

  @IsString()
  @IsOptional()
  managerComment?: string;
}
