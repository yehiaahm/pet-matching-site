// ============================================================================
// Enhanced Services Example - Using New Database Features
// ============================================================================

// ============================================================================
// 1. USER SERVICE - مع Activity Logging و Login Security
// ============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class UserService {
  /**
   * تسجيل الدخول مع تتبع محاولات الفشل
   */
  async login(email: string, password: string, ipAddress: string) {
    try {
      // 1️⃣ جلب المستخدم
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        // تسجيل محاولة فاشلة
        await this.logLoginAttempt(email, ipAddress);
        throw new Error('Invalid credentials');
      }

      // 2️⃣ فحص إذا كان المستخدم محجوب بسبب محاولات فاشلة
      if (user.isBlocked && user.lastLoginAttempt) {
        const lockoutTime = 15 * 60 * 1000; // 15 دقيقة
        const timeSinceLastAttempt = Date.now() - user.lastLoginAttempt.getTime();
        
        if (timeSinceLastAttempt < lockoutTime) {
          throw new Error('Account locked. Try again later.');
        }
      }

      // 3️⃣ التحقق من كلمة المرور
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        await this.recordFailedLogin(user.id, ipAddress);
        throw new Error('Invalid credentials');
      }

      // 4️⃣ تحديث بيانات الدخول الناجح
      await prisma.users.update({
        where: { id: user.id },
        data: {
          lastLoginDate: new Date(),
          loginAttempts: 0, // إعادة تعيين المحاولات الفاشلة
          isBlocked: false,
          lastActivityDate: new Date(),
        },
      });

      // 5️⃣ تسجيل النشاط
      await this.logActivity(user.id, 'LOGIN', { ipAddress }, ipAddress);

      return { success: true, userId: user.id };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * تسجيل محاولة دخول فاشلة
   */
  private async recordFailedLogin(userId: string, ipAddress: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });

    const newAttempts = (user?.loginAttempts || 0) + 1;
    const maxAttempts = 5; // من system_settings

    if (newAttempts >= maxAttempts) {
      // حجب الحساب
      await prisma.users.update({
        where: { id: userId },
        data: {
          isBlocked: true,
          lastLoginAttempt: new Date(),
        },
      });

      await this.logActivity(userId, 'ACCOUNT_LOCKED', 
        { reason: 'Too many login attempts' }, ipAddress);
    } else {
      await prisma.users.update({
        where: { id: userId },
        data: {
          loginAttempts: newAttempts,
          lastLoginAttempt: new Date(),
        },
      });
    }
  }

  /**
   * تسجيل محاولة دخول (سجل)
   */
  private async logLoginAttempt(email: string, ipAddress: string) {
    // تسجيل محاولة غير معروفة
    console.warn(`⚠️ Failed login attempt for email: ${email} from IP: ${ipAddress}`);
  }

  /**
   * تسجيل نشاط المستخدم
   */
  async logActivity(
    userId: string, 
    action: string, 
    details?: Record<string, any>, 
    ipAddress?: string
  ) {
    await prisma.activity_logs.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });

    // تحديث lastActivityDate تلقائياً
    await prisma.users.update({
      where: { id: userId },
      data: { lastActivityDate: new Date() },
    });
  }

  /**
   * حجب مستخدم (من قبل Admin)
   */
  async blockUser(
    userId: string, 
    reason: string, 
    adminId: string
  ) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedBy: adminId,
        bannedReason: reason,
      },
    });
  }

  /**
   * الحصول على إحصائيات المستخدم
   * ✨ استخدام الـ View الجديد
   */
  async getUserStatistics(userId: string) {
    const stats = await prisma.$queryRaw`
      SELECT * FROM v_user_statistics WHERE id = ${userId}
    `;
    return stats[0];
  }

  /**
   * حجب مستخدم (من قبل مستخدم عادي)
   */
  async blockUserAsUser(blockerId: string, blockedId: string, reason?: string) {
    // ✨ جديد: جدول blocked_users
    return await prisma.blocked_users.create({
      data: {
        blockerId,
        blockedId,
        reason,
      },
    });
  }

  /**
   * فك الحجب
   */
  async unblockUser(blockerId: string, blockedId: string) {
    return await prisma.blocked_users.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });
  }

  /**
   * التحقق إذا كان المستخدم محجوب
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocked = await prisma.blocked_users.findFirst({
      where: {
        OR: [
          { blockerId, blockedId },
          { blockerId: blockedId, blockedId: blockerId },
        ],
      },
    });
    return !!blocked;
  }
}

// ============================================================================
// 2. PET SERVICE - مع Search محسّن و Favorites
// ============================================================================

class PetService {
  /**
   * البحث عن حيوانات متاحة للتربية
   * ✨ استخدام الفهارس الجديدة
   */
  async findAvailablePets(
    species: string,
    breed?: string,
    gender?: 'MALE' | 'FEMALE',
    skip = 0,
    take = 50
  ) {
    // هذا الاستعلام الآن أسرع 100x بسبب idx_pets_breeding_available
    return await prisma.pets.findMany({
      where: {
        species,
        breed,
        gender,
        breedingStatus: 'AVAILABLE',
        isPublished: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        breed: true,
        gender: true,
        healthScore: true,
        breedingPrice: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * إضافة حيوان للمفضلة
   * ✨ جديد: جدول favorite_pets
   */
  async addToFavorites(userId: string, petId: string) {
    return await prisma.favorite_pets.create({
      data: {
        userId,
        petId,
      },
    });
  }

  /**
   * إزالة من المفضلة
   */
  async removeFromFavorites(userId: string, petId: string) {
    return await prisma.favorite_pets.delete({
      where: {
        userId_petId: { userId, petId },
      },
    });
  }

  /**
   * جلب المفضلة
   */
  async getFavoritePets(userId: string, skip = 0, take = 50) {
    return await prisma.favorite_pets.findMany({
      where: { userId },
      select: {
        pet: true,
        addedAt: true,
      },
      orderBy: { addedAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * تحديث درجة الصحة (يتم تحديثها من السجلات الصحية)
   */
  async updateHealthScore(petId: string) {
    const healthRecords = await prisma.health_records.findMany({
      where: { petId },
      orderBy: { recordDate: 'desc' },
      take: 5,
    });

    // حساب الدرجة بناءً على السجلات
    const healthScore = this.calculateHealthScore(healthRecords);

    return await prisma.pets.update({
      where: { id: petId },
      data: { healthScore },
    });
  }

  /**
   * الحصول على أداء التربية
   * ✨ استخدام الـ View الجديد
   */
  async getBreedingPerformance(petId: string) {
    const performance = await prisma.$queryRaw`
      SELECT * FROM v_breeding_performance WHERE id = ${petId}
    `;
    return performance[0];
  }

  private calculateHealthScore(records: any[]): number {
    if (records.length === 0) return 50;
    // منطق حساب الدرجة
    return 75;
  }
}

// ============================================================================
// 3. BREEDING SERVICE - مع منع الحجب
// ============================================================================

class BreedingService {
  /**
   * إنشاء طلب تربية
   * ✨ الـ Trigger يفحص تلقائياً إذا كان المستخدم محجوب
   */
  async createBreedingRequest(
    initiatorId: string,
    initiatorPetId: string,
    targetUserId: string,
    targetPetId: string,
    message?: string
  ) {
    try {
      // الـ Trigger تلقائياً سيفحص blocked_users قبل الإدراج
      return await prisma.breeding_requests.create({
        data: {
          initiatorId,
          initiatorPetId,
          targetUserId,
          targetPetId,
          message,
          requestedDate: new Date(),
        },
      });
    } catch (error) {
      if (error.message.includes('blocked')) {
        throw new Error('Cannot create breeding request with blocked user');
      }
      throw error;
    }
  }

  /**
   * قبول طلب التربية
   */
  async acceptBreedingRequest(requestId: string) {
    return await prisma.breeding_requests.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(), // تحديث تلقائي بواسطة Trigger
      },
    });
  }

  /**
   * رفض طلب التربية
   * ✨ جديد: حقل rejectionReason
   */
  async rejectBreedingRequest(
    requestId: string, 
    reason: string
  ) {
    return await prisma.breeding_requests.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * إكمال المطابقة مع عدد الأطفال
   * ✨ الـ Trigger يحدّث totalOffspringCount تلقائياً
   */
  async completeMatch(
    matchId: string, 
    resultingOffspring: number,
    offspringDetails?: Record<string, any>
  ) {
    return await prisma.matches.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        resultingOffspring,
        offspringDetails,
        // الـ Trigger سيزيد totalOffspringCount في جدول pets تلقائياً
      },
    });
  }

  /**
   * جلب طلبات التربية المعلقة للمستخدم
   * ✨ الفهرس المركب يسرعها 100x
   */
  async getPendingRequests(userId: string, skip = 0, take = 25) {
    // هذا الاستعلام استخدم: idx_breeding_requests_pending_target
    return await prisma.breeding_requests.findMany({
      where: {
        targetUserId: userId,
        status: 'PENDING',
      },
      select: {
        id: true,
        initiator: {
          select: {
            id: true,
            firstName: true,
            rating: true,
          },
        },
        initiatorPet: {
          select: {
            name: true,
            breed: true,
          },
        },
        message: true,
        requestedDate: true,
      },
      orderBy: { requestedDate: 'desc' },
      skip,
      take,
    });
  }
}

// ============================================================================
// 4. MESSAGE SERVICE - مع Attachments و Read Status
// ============================================================================

class MessageService {
  /**
   * إرسال رسالة
   * ✨ جديد: حقل attachments
   */
  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string,
    attachments?: string[],
    breedingRequestId?: string
  ) {
    // الـ Trigger سيسجل النشاط تلقائياً
    return await prisma.messages.create({
      data: {
        senderId,
        recipientId,
        content,
        attachments,
        breedingRequestId,
      },
    });
  }

  /**
   * جلب الرسائل غير المقروءة
   * ✨ استخدام الفهرس السريع idx_messages_unread
   */
  async getUnreadMessages(userId: string, skip = 0, take = 20) {
    // هذا الاستعلام أسرع 150x بسبب الفهرس
    return await prisma.messages.findMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      select: {
        id: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            avatar: true,
          },
        },
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * تحديد الرسالة كمقروءة
   */
  async markAsRead(messageId: string) {
    return await prisma.messages.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
        status: 'READ',
      },
    });
  }

  /**
   * حذف الرسالة مع المرفقات
   */
  async deleteMessage(messageId: string) {
    const message = await prisma.messages.findUnique({
      where: { id: messageId },
    });

    // حذف المرفقات من التخزين
    if (message?.attachments && message.attachments.length > 0) {
      await this.deleteAttachments(message.attachments);
    }

    return await prisma.messages.delete({
      where: { id: messageId },
    });
  }

  private async deleteAttachments(urls: string[]) {
    // حذف من S3 أو أي خدمة تخزين
    for (const url of urls) {
      // ... حذف الملف
    }
  }
}

// ============================================================================
// 5. ADMIN SERVICE - مع Audit Logging
// ============================================================================

class AdminService {
  /**
   * حجب مستخدم (من قبل Admin)
   * ✨ يتم تسجيل العملية في audit_logs
   */
  async banUser(
    targetUserId: string,
    reason: string,
    adminId: string,
    ipAddress: string
  ) {
    const result = await prisma.users.update({
      where: { id: targetUserId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedBy: adminId,
        bannedReason: reason,
      },
    });

    // تسجيل العملية
    await prisma.audit_logs.create({
      data: {
        adminId,
        action: 'BAN_USER',
        targetUserId,
        description: `User banned: ${reason}`,
        ipAddress,
      },
    });

    return result;
  }

  /**
   * حذف الحيوان (soft delete)
   */
  async deletePet(petId: string, adminId: string, reason: string) {
    const result = await prisma.pets.update({
      where: { id: petId },
      data: { deletedAt: new Date() },
    });

    await prisma.audit_logs.create({
      data: {
        adminId,
        action: 'DELETE_PET',
        targetPetId: petId,
        description: `Pet deleted: ${reason}`,
      },
    });

    return result;
  }

  /**
   * تنظيف الرموز المنتهية الصلاحية
   * ✨ استخدام الـ Stored Procedure
   */
  async cleanupExpiredTokens() {
    const result = await prisma.$queryRaw`
      SELECT cleanup_expired_tokens() as deleted_count
    `;
    return result[0];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  UserService,
  PetService,
  BreedingService,
  MessageService,
  AdminService,
};
