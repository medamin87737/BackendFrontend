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

  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  requiredSkills: Array<{
    skill_name: string;
    desired_level: string;
    weight?: number;
  }>;

  @Prop({ required: true, min: 1 })
  maxParticipants: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ maxlength: 255 })
  location?: string;

  @Prop({ type: String, enum: ActivityPriority, default: ActivityPriority.CONSOLIDATE })
  priority: ActivityPriority;

  @Prop({ type: String, enum: ActivityStatus, default: ActivityStatus.CREATED })
  status: ActivityStatus;

  @Prop({ type: Number, default: 0 })
  duration?: number; // Durée en heures

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Index pour améliorer les performances
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ managerId: 1 });
ActivitySchema.index({ departmentId: 1 });
ActivitySchema.index({ startDate: 1 });
ActivitySchema.index({ createdBy: 1 });
