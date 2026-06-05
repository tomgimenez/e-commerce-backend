import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async createWelcomeNotification(user: User, discountCode: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      title: 'Welcome to The LoreVault! 🧙‍♂️',
      message: 'As a welcome gift you have a 15% discount in your first purchase',
      type: NotificationType.DISCOUNT,
      metadata: { discountCode, discount: 15 },
      read: false,
      user
    });

    return await this.notificationRepository.save(notification);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, user: { id: userId } },
      { read: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('userId = :userId', { userId })
      .andWhere('read = false')
      .execute();
  }
}
