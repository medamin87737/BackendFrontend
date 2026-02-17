import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityStatus {
  CREATED = 'CREATED',
  RECOMMENDED = 'RECOMMENDED',
  VALIDATED = 'VALIDATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ActivityType {
  FORMATION = 'FORMATION',
  CERTIFICATION = 'CERTIFICATION',
  AUDIT = 'AUDIT',
  PROJECT = 'PROJECT',
  MISSION = 'MISSION',
}

export enum ActivityPriority {
  DEVELOP_LOW = 'DEVELOP_LOW',
  CONSOLIDATE = 'CONSOLIDATE',
  EXPERT = 'EXPERT',
}

export enum SkillType {
  KNOWLEDGE = 'KNOWLEDGE',
  KNOW_HOW = 'KNOW_HOW',
  SOFT_SKILLS = 'SOFT_SKILLS',
}

export enum SkillLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXPERT = 'EXPERT',
}

export interface RequiredSkill {
  name: string;
  type: SkillType;
  level: SkillLevel;
  weight: number; // 0-1
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId; // HR qui a créé l'activité

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  managerId: Types.ObjectId; // Manager responsable

  @Prop({ type: Array, default: [] })
  requiredSkills: RequiredSkill[];

  @Prop({ required: true, min: 1 })
  maxParticipants: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ maxlength: 255 })
  location?: string;

  @Prop({ type: String, enum: ActivityPriority, default: ActivityPriority.CONSOLIDATE })
  priority: ActivityPriority;

  @Prop({ type: String, enum: ActivityStatus, default: ActivityStatus.CREATED })
  status: ActivityStatus;

  @Prop({ type: Number, default: 0 })
  duration?: number; // Durée en heures
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Index pour améliorer les performances
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ managerId: 1 });
ActivitySchema.index({ departmentId: 1 });
ActivitySchema.index({ startDate: 1 });
ActivitySchema.index({ createdBy: 1 });
