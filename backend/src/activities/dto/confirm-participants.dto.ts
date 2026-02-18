import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class ConfirmParticipantsDto {
  @IsArray()
  @IsMongoId({ each: true })
  confirmedEmployeeIds: string[]; // IDs des employés confirmés par le manager

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  rejectedEmployeeIds?: string[]; // IDs des employés rejetés par le manager

  @IsString()
  @IsOptional()
  managerComment?: string; // Commentaire optionnel du manager
}
