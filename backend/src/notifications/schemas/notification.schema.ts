import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ACTIVITY_FORWARDED = 'ACTIVITY_FORWARDED', // Activité transférée au manager
  PARTICIPATION_REQUEST = 'PARTICIPATION_REQUEST', // Demande de participation à un employé
  PARTICIPATION_ACCEPTED = 'PARTICIPATION_ACCEPTED', // Employé a accepté
  PARTICIPATION_DECLINED = 'PARTICIPATION_DECLINED', // Employé a refusé
  ACTIVITY_REMINDER = 'ACTIVITY_REMINDER', // Rappel d'activité (J-7, J-1)
  ACTIVITY_STARTED = 'ACTIVITY_STARTED', // Activité démarrée
  ACTIVITY_COMPLETED = 'ACTIVITY_COMPLETED', // Activité terminée
  EVALUATION_REQUEST = 'EVALUATION_REQUEST', // Demande d'évaluation
  SEATS_AVAILABLE = 'SEATS_AVAILABLE', // Places disponibles après refus
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Destinataire de la notification

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activityId?: Types.ObjectId; // Référence à l'activité concernée

  @Prop({ type: Types.ObjectId, ref: 'Participation' })
  participationId?: Types.ObjectId; // Référence à la participation concernée

  @Prop({ type: String, enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Données supplémentaires (JSON)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index pour améliorer les performances
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ activityId: 1 });
