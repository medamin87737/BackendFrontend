import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParticipationDocument = Participation & Document;

export enum ParticipationStatus {
  PENDING = 'PENDING', // En attente de réponse de l'employé
  ACCEPTED = 'ACCEPTED', // Accepté par l'employé
  DECLINED = 'DECLINED', // Refusé par l'employé
  REJECTED_BY_MANAGER = 'REJECTED_BY_MANAGER', // Rejeté par le manager
  CANCELLED = 'CANCELLED', // Annulé
}

@Schema({ timestamps: true })
export class Participation {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  activityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: ParticipationStatus, default: ParticipationStatus.PENDING })
  status: ParticipationStatus;

  @Prop({ type: String, maxlength: 500 })
  justification?: string; // Justification en cas de refus

  @Prop({ type: Date })
  respondedAt?: Date; // Date de réponse de l'employé

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  confirmedBy: Types.ObjectId; // Manager qui a confirmé la participation
}

export const ParticipationSchema = SchemaFactory.createForClass(Participation);

// Index pour améliorer les performances
ParticipationSchema.index({ activityId: 1 });
ParticipationSchema.index({ employeeId: 1 });
ParticipationSchema.index({ status: 1 });
ParticipationSchema.index({ activityId: 1, employeeId: 1 }, { unique: true }); // Un employé ne peut participer qu'une fois à une activité
