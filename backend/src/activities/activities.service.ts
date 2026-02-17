import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument, ActivityStatus } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(createActivityDto: CreateActivityDto) {
    const activity = new this.activityModel(createActivityDto);
    return activity.save();
  }

  async findAll() {
    return this.activityModel
      .find()
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email')
      .populate('managerId', 'name email')
      .sort({ startDate: -1 });
  }

  async findOne(id: string) {
    const activity = await this.activityModel
      .findById(id)
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email matricule')
      .populate('managerId', 'name email matricule');
    
    if (!activity) throw new NotFoundException('Activité non trouvée');
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    const activity = await this.activityModel.findByIdAndUpdate(
      id,
      updateActivityDto,
      { new: true },
    );
    if (!activity) throw new NotFoundException('Activité non trouvée');
    return activity;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID invalide');
    }
    const activity = await this.activityModel.findByIdAndDelete(id);
    if (!activity) throw new NotFoundException('Activité non trouvée');
    return { message: 'Activité supprimée avec succès' };
  }

  // ============ MÉTHODES SPÉCIFIQUES MANAGER ============

  async findByManager(managerId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ managerId: new Types.ObjectId(managerId) })
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 })
      .exec();
  }

  async findPendingForManager(managerId: string): Promise<Activity[]> {
    return this.activityModel
      .find({
        managerId: new Types.ObjectId(managerId),
        status: { $in: [ActivityStatus.VALIDATED, ActivityStatus.IN_PROGRESS] },
      })
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .exec();
  }

  async forwardToManager(activityId: string): Promise<Activity> {
    const activity = await this.activityModel.findByIdAndUpdate(
      activityId,
      { status: ActivityStatus.IN_PROGRESS },
      { new: true },
    );

    if (!activity) {
      throw new NotFoundException('Activité non trouvée');
    }

    return activity;
  }

  async updateStatus(activityId: string, status: ActivityStatus): Promise<Activity> {
    const activity = await this.activityModel.findByIdAndUpdate(
      activityId,
      { status },
      { new: true },
    );

    if (!activity) {
      throw new NotFoundException('Activité non trouvée');
    }

    return activity;
  }

  async findByDepartment(departmentId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .populate('createdBy', 'name email')
      .populate('managerId', 'name email')
      .sort({ startDate: -1 })
      .exec();
  }

  async findByStatus(status: ActivityStatus): Promise<Activity[]> {
    return this.activityModel
      .find({ status })
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email')
      .populate('managerId', 'name email')
      .sort({ startDate: -1 })
      .exec();
  }
}
