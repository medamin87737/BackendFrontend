import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Participation, ParticipationDocument, ParticipationStatus } from './schemas/participation.schema';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Injectable()
export class ParticipationsService {
  constructor(
    @InjectModel(Participation.name)
    private participationModel: Model<ParticipationDocument>,
  ) {}

  async create(createDto: CreateParticipationDto): Promise<Participation> {
    // Vérifier si la participation existe déjà
    const existing = await this.participationModel.findOne({
      activityId: new Types.ObjectId(createDto.activityId),
      employeeId: new Types.ObjectId(createDto.employeeId),
    });

    if (existing) {
      throw new BadRequestException('Cet employé est déjà inscrit à cette activité');
    }

    const participation = new this.participationModel({
      activityId: new Types.ObjectId(createDto.activityId),
      employeeId: new Types.ObjectId(createDto.employeeId),
      confirmedBy: new Types.ObjectId(createDto.confirmedBy),
      status: ParticipationStatus.PENDING,
    });

    return participation.save();
  }

  async createMany(activityId: string, employeeIds: string[], managerId: string): Promise<any[]> {
    const participations = employeeIds.map((employeeId) => ({
      activityId: new Types.ObjectId(activityId),
      employeeId: new Types.ObjectId(employeeId),
      confirmedBy: new Types.ObjectId(managerId),
      status: ParticipationStatus.PENDING,
    }));

    return this.participationModel.insertMany(participations, { ordered: false });
  }

  async findAll(): Promise<Participation[]> {
    return this.participationModel
      .find()
      .populate('activityId', 'title description startDate endDate')
      .populate('employeeId', 'name email matricule')
      .populate('confirmedBy', 'name email')
      .exec();
  }

  async findByActivity(activityId: string): Promise<Participation[]> {
    return this.participationModel
      .find({ activityId: new Types.ObjectId(activityId) })
      .populate('employeeId', 'name email matricule department_id')
      .populate('confirmedBy', 'name email')
      .exec();
  }

  async findByEmployee(employeeId: string): Promise<Participation[]> {
    return this.participationModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('activityId', 'title description startDate endDate location type')
      .populate('confirmedBy', 'name email')
      .exec();
  }

  async findOne(id: string): Promise<Participation> {
    const participation = await this.participationModel
      .findById(id)
      .populate('activityId')
      .populate('employeeId', 'name email matricule')
      .populate('confirmedBy', 'name email')
      .exec();

    if (!participation) {
      throw new NotFoundException('Participation non trouvée');
    }

    return participation;
  }

  async update(id: string, updateDto: UpdateParticipationDto): Promise<Participation> {
    // Si l'employé refuse, la justification est obligatoire
    if (updateDto.status === ParticipationStatus.DECLINED && !updateDto.justification) {
      throw new BadRequestException('Une justification est obligatoire en cas de refus');
    }

    const participation = await this.participationModel.findByIdAndUpdate(
      id,
      {
        ...updateDto,
        respondedAt: new Date(),
      },
      { new: true },
    );

    if (!participation) {
      throw new NotFoundException('Participation non trouvée');
    }

    return participation;
  }

  async acceptParticipation(id: string): Promise<Participation> {
    return this.update(id, { status: ParticipationStatus.ACCEPTED });
  }

  async declineParticipation(id: string, justification: string): Promise<Participation> {
    return this.update(id, {
      status: ParticipationStatus.DECLINED,
      justification,
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.participationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Participation non trouvée');
    }
  }

  async countByActivityAndStatus(activityId: string, status: ParticipationStatus): Promise<number> {
    return this.participationModel.countDocuments({
      activityId: new Types.ObjectId(activityId),
      status,
    });
  }

  async getAvailableSeats(activityId: string, maxParticipants: number): Promise<number> {
    const acceptedCount = await this.countByActivityAndStatus(activityId, ParticipationStatus.ACCEPTED);
    const pendingCount = await this.countByActivityAndStatus(activityId, ParticipationStatus.PENDING);
    return maxParticipants - (acceptedCount + pendingCount);
  }
}
