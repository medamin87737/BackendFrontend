import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createDto,
      userId: new Types.ObjectId(createDto.userId),
      activityId: createDto.activityId ? new Types.ObjectId(createDto.activityId) : undefined,
      participationId: createDto.participationId ? new Types.ObjectId(createDto.participationId) : undefined,
    });

    return notification.save();
  }

  async createMany(notifications: CreateNotificationDto[]): Promise<any[]> {
    const docs = notifications.map((notif) => ({
      ...notif,
      userId: new Types.ObjectId(notif.userId),
      activityId: notif.activityId ? new Types.ObjectId(notif.activityId) : undefined,
      participationId: notif.participationId ? new Types.ObjectId(notif.participationId) : undefined,
    }));

    return this.notificationModel.insertMany(docs);
  }

  async findByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) {
      query.read = false;
    }

    return this.notificationModel
      .find(query)
      .populate('activityId', 'title description startDate')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('activityId')
      .populate('participationId')
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true, readAt: new Date() },
    );
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Notification non trouvée');
    }
  }

  async removeAllForUser(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  // Méthodes utilitaires pour créer des notifications spécifiques

  async notifyActivityForwarded(managerId: string, activityId: string, activityTitle: string): Promise<Notification> {
    return this.create({
      userId: managerId,
      type: NotificationType.ACTIVITY_FORWARDED,
      title: 'Nouvelle activité à traiter',
      content: `L'activité "${activityTitle}" vous a été assignée. Veuillez confirmer les participants.`,
      activityId,
      priority: NotificationPriority.HIGH,
    });
  }

  async notifyParticipationRequest(employeeId: string, activityId: string, activityTitle: string): Promise<Notification> {
    return this.create({
      userId: employeeId,
      type: NotificationType.PARTICIPATION_REQUEST,
      title: 'Nouvelle invitation à une activité',
      content: `Vous êtes invité(e) à participer à l'activité "${activityTitle}". Veuillez confirmer votre participation.`,
      activityId,
      priority: NotificationPriority.HIGH,
    });
  }

  async notifyParticipationResponse(
    managerId: string,
    employeeName: string,
    activityTitle: string,
    accepted: boolean,
  ): Promise<Notification> {
    return this.create({
      userId: managerId,
      type: accepted ? NotificationType.PARTICIPATION_ACCEPTED : NotificationType.PARTICIPATION_DECLINED,
      title: accepted ? 'Participation acceptée' : 'Participation refusée',
      content: `${employeeName} a ${accepted ? 'accepté' : 'refusé'} de participer à "${activityTitle}".`,
      priority: accepted ? NotificationPriority.MEDIUM : NotificationPriority.HIGH,
    });
  }

  async notifySeatsAvailable(managerId: string, activityId: string, activityTitle: string, availableSeats: number): Promise<Notification> {
    return this.create({
      userId: managerId,
      type: NotificationType.SEATS_AVAILABLE,
      title: 'Places disponibles',
      content: `${availableSeats} place(s) disponible(s) pour l'activité "${activityTitle}". Vous pouvez sélectionner des remplaçants.`,
      activityId,
      priority: NotificationPriority.HIGH,
    });
  }
}
