import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 50 })
  code: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  manager_id?: Types.ObjectId; // Référence au manager du département
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Index pour améliorer les performances
// Note: code a déjà un index unique via @Prop({ unique: true })
DepartmentSchema.index({ manager_id: 1 });
