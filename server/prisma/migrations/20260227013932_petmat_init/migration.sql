-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_USER', 'CANCELLED_ADMIN', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BreedingStatus" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'RETIRED');

-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('PEDIGREE', 'GENETIC_TEST', 'HEALTH_CHECK', 'VACCINATION', 'MICROCHIP', 'REGISTRATION', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'WARNING', 'MAINTENANCE', 'INFO');

-- CreateEnum
CREATE TYPE "PetOnboardingStatus" AS ENUM ('PENDING_PET', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FRAUD', 'SCAM', 'DANGEROUS_BEHAVIOR', 'ANIMAL_ABUSE', 'FAKE_PROFILE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED', 'APPEALED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'BREEDER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('HEALTH_CHECKUP', 'VACCINATION', 'GENETIC_TEST', 'MICROCHIP', 'CERTIFICATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'ACCOUNT', 'PAYMENT', 'MATCHING', 'SAFETY', 'FEEDBACK', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'REPLIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MarketplaceCategory" AS ENUM ('FOOD', 'TOYS', 'ACCESSORIES', 'MEDICAL', 'GROOMING');

-- CreateEnum
CREATE TYPE "MarketplaceOrderStatus" AS ENUM ('pending', 'paid', 'shipped', 'delivered');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "targetUserId" TEXT,
    "targetPetId" TEXT,
    "description" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_requests" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "initiatorPetId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "targetPetId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferredDate" TIMESTAMP(3),
    "estimatedDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "certificateUrl" VARCHAR(500),
    "verificationStatus" VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    "issuer" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "operatingHours" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_bookings" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" VARCHAR(20) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "userNotes" TEXT,
    "adminNotes" TEXT,
    "certificate" VARCHAR(500),
    "resultNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "clinic_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_services" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genetic_tests" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "testName" VARCHAR(150) NOT NULL,
    "provider" VARCHAR(150) NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "certificateUrl" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genetic_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "recordType" VARCHAR(50) NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "veterinarianName" VARCHAR(150) NOT NULL,
    "clinicName" VARCHAR(150),
    "details" TEXT,
    "certificateUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "breedingRequestId" TEXT NOT NULL,
    "initiatorPetId" TEXT NOT NULL,
    "targetPetId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "resultingOffspring" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "breedingRequestId" TEXT,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(100) NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "color" VARCHAR(100),
    "distinctiveFeatures" TEXT,
    "isVaccinated" BOOLEAN NOT NULL DEFAULT false,
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "healthConditions" TEXT,
    "lastHealthCheckDate" TIMESTAMP(3),
    "nextVaccinationDate" TIMESTAMP(3),
    "breedingStatus" "BreedingStatus" NOT NULL DEFAULT 'NOT_AVAILABLE',
    "breedingPrice" DOUBLE PRECISION,
    "nextAvailableDate" TIMESTAMP(3),
    "hasPedigree" BOOLEAN NOT NULL DEFAULT false,
    "pedigreeNumber" VARCHAR(100),
    "registrationNumber" VARCHAR(100),
    "microchipNumber" VARCHAR(100),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reportedPetId" TEXT,
    "reportedContentId" TEXT,
    "contentType" VARCHAR(50) NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "breedingRequestId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "petsListedCount" INTEGER NOT NULL DEFAULT 0,
    "requestsSentCount" INTEGER NOT NULL DEFAULT 0,
    "requestsSentMonth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "replies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_announcements" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "enableUserRegistration" BOOLEAN NOT NULL DEFAULT true,
    "enableBreedingRequests" BOOLEAN NOT NULL DEFAULT true,
    "enableMessaging" BOOLEAN NOT NULL DEFAULT true,
    "maxWarningsBeforeBan" INTEGER NOT NULL DEFAULT 3,
    "autoDeleteReportsAfter" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_pet_onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstPetId" TEXT,
    "status" "PetOnboardingStatus" NOT NULL DEFAULT 'PENDING_PET',
    "requiredPet" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pet_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatar" VARCHAR(500),
    "bio" TEXT,
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(255),
    "verificationExpiresAt" TIMESTAMP(3),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "bannedAt" TIMESTAMP(3),
    "bannedBy" TEXT,
    "bannedReason" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "lastWarningAt" TIMESTAMP(3),
    "warnings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_seller_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "description" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_seller_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_products" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" "MarketplaceCategory" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MarketplaceOrderStatus" NOT NULL DEFAULT 'pending',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellerPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "sellerEarning" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_pets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_pet_images" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "app_pet_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_match_requests" (
    "id" TEXT NOT NULL,
    "senderPetId" TEXT NOT NULL,
    "targetPetId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_ai_matches" (
    "id" TEXT NOT NULL,
    "pet1Id" TEXT NOT NULL,
    "pet2Id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "app_ai_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_conversations" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_health_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vaccine" TEXT,
    "notes" TEXT,
    "vetName" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "app_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "app_user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "screenshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_gps_tracks" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "petId" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "source" TEXT DEFAULT 'mobile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_gps_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_dashboard_metrics" (
    "id" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalPets" INTEGER NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "totalPayments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetUserId_idx" ON "audit_logs"("targetUserId");

-- CreateIndex
CREATE INDEX "breeding_requests_createdAt_idx" ON "breeding_requests"("createdAt");

-- CreateIndex
CREATE INDEX "breeding_requests_initiatorId_idx" ON "breeding_requests"("initiatorId");

-- CreateIndex
CREATE INDEX "breeding_requests_status_idx" ON "breeding_requests"("status");

-- CreateIndex
CREATE INDEX "breeding_requests_targetUserId_idx" ON "breeding_requests"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "breeding_requests_initiatorId_initiatorPetId_targetUserId_t_key" ON "breeding_requests"("initiatorId", "initiatorPetId", "targetUserId", "targetPetId");

-- CreateIndex
CREATE INDEX "certifications_petId_idx" ON "certifications"("petId");

-- CreateIndex
CREATE INDEX "certifications_type_idx" ON "certifications"("type");

-- CreateIndex
CREATE INDEX "certifications_verificationStatus_idx" ON "certifications"("verificationStatus");

-- CreateIndex
CREATE INDEX "clinic_bookings_bookingDate_idx" ON "clinic_bookings"("bookingDate");

-- CreateIndex
CREATE INDEX "clinic_bookings_petId_idx" ON "clinic_bookings"("petId");

-- CreateIndex
CREATE INDEX "clinic_bookings_status_idx" ON "clinic_bookings"("status");

-- CreateIndex
CREATE INDEX "clinic_bookings_userId_idx" ON "clinic_bookings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_bookings_clinicId_bookingDate_timeSlot_key" ON "clinic_bookings"("clinicId", "bookingDate", "timeSlot");

-- CreateIndex
CREATE INDEX "clinic_services_clinicId_idx" ON "clinic_services"("clinicId");

-- CreateIndex
CREATE INDEX "clinic_services_type_idx" ON "clinic_services"("type");

-- CreateIndex
CREATE INDEX "genetic_tests_petId_idx" ON "genetic_tests"("petId");

-- CreateIndex
CREATE INDEX "genetic_tests_testDate_idx" ON "genetic_tests"("testDate");

-- CreateIndex
CREATE INDEX "health_records_petId_idx" ON "health_records"("petId");

-- CreateIndex
CREATE INDEX "health_records_recordDate_idx" ON "health_records"("recordDate");

-- CreateIndex
CREATE INDEX "health_records_recordType_idx" ON "health_records"("recordType");

-- CreateIndex
CREATE UNIQUE INDEX "matches_breedingRequestId_key" ON "matches"("breedingRequestId");

-- CreateIndex
CREATE INDEX "matches_completedDate_idx" ON "matches"("completedDate");

-- CreateIndex
CREATE INDEX "matches_scheduledDate_idx" ON "matches"("scheduledDate");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "messages_breedingRequestId_idx" ON "messages"("breedingRequestId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_recipientId_idx" ON "messages"("recipientId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pets_pedigreeNumber_key" ON "pets"("pedigreeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pets_registrationNumber_key" ON "pets"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pets_microchipNumber_key" ON "pets"("microchipNumber");

-- CreateIndex
CREATE INDEX "pets_breed_idx" ON "pets"("breed");

-- CreateIndex
CREATE INDEX "pets_breedingStatus_idx" ON "pets"("breedingStatus");

-- CreateIndex
CREATE INDEX "pets_createdAt_idx" ON "pets"("createdAt");

-- CreateIndex
CREATE INDEX "pets_gender_idx" ON "pets"("gender");

-- CreateIndex
CREATE INDEX "pets_isPublished_idx" ON "pets"("isPublished");

-- CreateIndex
CREATE INDEX "pets_ownerId_idx" ON "pets"("ownerId");

-- CreateIndex
CREATE INDEX "pets_species_idx" ON "pets"("species");

-- CreateIndex
CREATE UNIQUE INDEX "pets_ownerId_name_key" ON "pets"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "reports_reportedUserId_idx" ON "reports"("reportedUserId");

-- CreateIndex
CREATE INDEX "reports_reporterUserId_idx" ON "reports"("reporterUserId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_revieweeId_idx" ON "reviews"("revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewerId_breedingRequestId_key" ON "reviews"("reviewerId", "breedingRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_createdAt_idx" ON "support_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "support_tickets_email_idx" ON "support_tickets"("email");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "system_announcements_active_idx" ON "system_announcements"("active");

-- CreateIndex
CREATE INDEX "system_announcements_createdAt_idx" ON "system_announcements"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_id_key" ON "system_settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_pet_onboarding_userId_key" ON "user_pet_onboarding"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_pet_onboarding_firstPetId_key" ON "user_pet_onboarding"("firstPetId");

-- CreateIndex
CREATE INDEX "user_pet_onboarding_createdAt_idx" ON "user_pet_onboarding"("createdAt");

-- CreateIndex
CREATE INDEX "user_pet_onboarding_status_idx" ON "user_pet_onboarding"("status");

-- CreateIndex
CREATE INDEX "user_pet_onboarding_userId_status_idx" ON "user_pet_onboarding"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- CreateIndex
CREATE INDEX "users_city_idx" ON "users"("city");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_isBanned_idx" ON "users"("isBanned");

-- CreateIndex
CREATE INDEX "users_isVerified_idx" ON "users"("isVerified");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");

-- CreateIndex
CREATE INDEX "app_users_createdAt_idx" ON "app_users"("createdAt");

-- CreateIndex
CREATE INDEX "app_users_role_idx" ON "app_users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "app_seller_accounts_userId_key" ON "app_seller_accounts"("userId");

-- CreateIndex
CREATE INDEX "app_seller_accounts_isActive_idx" ON "app_seller_accounts"("isActive");

-- CreateIndex
CREATE INDEX "app_seller_accounts_createdAt_idx" ON "app_seller_accounts"("createdAt");

-- CreateIndex
CREATE INDEX "app_products_sellerId_idx" ON "app_products"("sellerId");

-- CreateIndex
CREATE INDEX "app_products_category_idx" ON "app_products"("category");

-- CreateIndex
CREATE INDEX "app_products_createdAt_idx" ON "app_products"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "app_carts_userId_key" ON "app_carts"("userId");

-- CreateIndex
CREATE INDEX "app_carts_createdAt_idx" ON "app_carts"("createdAt");

-- CreateIndex
CREATE INDEX "app_cart_items_productId_idx" ON "app_cart_items"("productId");

-- CreateIndex
CREATE INDEX "app_cart_items_createdAt_idx" ON "app_cart_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "app_cart_items_cartId_productId_key" ON "app_cart_items"("cartId", "productId");

-- CreateIndex
CREATE INDEX "app_orders_userId_idx" ON "app_orders"("userId");

-- CreateIndex
CREATE INDEX "app_orders_status_idx" ON "app_orders"("status");

-- CreateIndex
CREATE INDEX "app_orders_createdAt_idx" ON "app_orders"("createdAt");

-- CreateIndex
CREATE INDEX "app_order_items_orderId_idx" ON "app_order_items"("orderId");

-- CreateIndex
CREATE INDEX "app_order_items_productId_idx" ON "app_order_items"("productId");

-- CreateIndex
CREATE INDEX "app_order_items_sellerId_idx" ON "app_order_items"("sellerId");

-- CreateIndex
CREATE INDEX "app_pets_ownerId_idx" ON "app_pets"("ownerId");

-- CreateIndex
CREATE INDEX "app_pets_type_breed_idx" ON "app_pets"("type", "breed");

-- CreateIndex
CREATE INDEX "app_pets_createdAt_idx" ON "app_pets"("createdAt");

-- CreateIndex
CREATE INDEX "app_pet_images_petId_idx" ON "app_pet_images"("petId");

-- CreateIndex
CREATE INDEX "app_match_requests_senderPetId_idx" ON "app_match_requests"("senderPetId");

-- CreateIndex
CREATE INDEX "app_match_requests_targetPetId_idx" ON "app_match_requests"("targetPetId");

-- CreateIndex
CREATE INDEX "app_match_requests_status_createdAt_idx" ON "app_match_requests"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "app_match_requests_senderPetId_targetPetId_status_key" ON "app_match_requests"("senderPetId", "targetPetId", "status");

-- CreateIndex
CREATE INDEX "app_ai_matches_pet1Id_idx" ON "app_ai_matches"("pet1Id");

-- CreateIndex
CREATE INDEX "app_ai_matches_pet2Id_idx" ON "app_ai_matches"("pet2Id");

-- CreateIndex
CREATE INDEX "app_ai_matches_score_idx" ON "app_ai_matches"("score");

-- CreateIndex
CREATE INDEX "app_conversations_createdAt_idx" ON "app_conversations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "app_conversations_user1Id_user2Id_key" ON "app_conversations"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "app_messages_conversationId_createdAt_idx" ON "app_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "app_messages_senderId_idx" ON "app_messages"("senderId");

-- CreateIndex
CREATE INDEX "app_health_records_petId_date_idx" ON "app_health_records"("petId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "app_subscription_plans_name_key" ON "app_subscription_plans"("name");

-- CreateIndex
CREATE INDEX "app_user_subscriptions_userId_status_idx" ON "app_user_subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "app_user_subscriptions_endDate_idx" ON "app_user_subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "app_payments_userId_createdAt_idx" ON "app_payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "app_payments_status_idx" ON "app_payments"("status");

-- CreateIndex
CREATE INDEX "app_gps_tracks_userId_createdAt_idx" ON "app_gps_tracks"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "app_gps_tracks_petId_createdAt_idx" ON "app_gps_tracks"("petId", "createdAt");

-- CreateIndex
CREATE INDEX "app_gps_tracks_createdAt_idx" ON "app_gps_tracks"("createdAt");

-- CreateIndex
CREATE INDEX "app_analytics_events_eventType_idx" ON "app_analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "app_analytics_events_createdAt_idx" ON "app_analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "app_analytics_events_userId_createdAt_idx" ON "app_analytics_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "app_verification_codes_userId_type_createdAt_idx" ON "app_verification_codes"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "app_verification_codes_expiresAt_idx" ON "app_verification_codes"("expiresAt");

-- CreateIndex
CREATE INDEX "app_verification_codes_code_idx" ON "app_verification_codes"("code");

-- CreateIndex
CREATE INDEX "app_dashboard_metrics_metricDate_idx" ON "app_dashboard_metrics"("metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "app_dashboard_metrics_metricDate_key" ON "app_dashboard_metrics"("metricDate");

-- AddForeignKey
ALTER TABLE "breeding_requests" ADD CONSTRAINT "breeding_requests_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_requests" ADD CONSTRAINT "breeding_requests_initiatorPetId_fkey" FOREIGN KEY ("initiatorPetId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_requests" ADD CONSTRAINT "breeding_requests_targetPetId_fkey" FOREIGN KEY ("targetPetId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_requests" ADD CONSTRAINT "breeding_requests_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_bookings" ADD CONSTRAINT "clinic_bookings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_bookings" ADD CONSTRAINT "clinic_bookings_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_bookings" ADD CONSTRAINT "clinic_bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clinic_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_bookings" ADD CONSTRAINT "clinic_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genetic_tests" ADD CONSTRAINT "genetic_tests_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_breedingRequestId_fkey" FOREIGN KEY ("breedingRequestId") REFERENCES "breeding_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_initiatorPetId_fkey" FOREIGN KEY ("initiatorPetId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_targetPetId_fkey" FOREIGN KEY ("targetPetId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_breedingRequestId_fkey" FOREIGN KEY ("breedingRequestId") REFERENCES "breeding_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_breedingRequestId_fkey" FOREIGN KEY ("breedingRequestId") REFERENCES "breeding_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pet_onboarding" ADD CONSTRAINT "user_pet_onboarding_firstPetId_fkey" FOREIGN KEY ("firstPetId") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pet_onboarding" ADD CONSTRAINT "user_pet_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_seller_accounts" ADD CONSTRAINT "app_seller_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_products" ADD CONSTRAINT "app_products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "app_seller_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_carts" ADD CONSTRAINT "app_carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_cart_items" ADD CONSTRAINT "app_cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "app_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_cart_items" ADD CONSTRAINT "app_cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "app_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_orders" ADD CONSTRAINT "app_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_order_items" ADD CONSTRAINT "app_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "app_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_order_items" ADD CONSTRAINT "app_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "app_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_order_items" ADD CONSTRAINT "app_order_items_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "app_seller_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_pets" ADD CONSTRAINT "app_pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_pet_images" ADD CONSTRAINT "app_pet_images_petId_fkey" FOREIGN KEY ("petId") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_match_requests" ADD CONSTRAINT "app_match_requests_senderPetId_fkey" FOREIGN KEY ("senderPetId") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_match_requests" ADD CONSTRAINT "app_match_requests_targetPetId_fkey" FOREIGN KEY ("targetPetId") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_ai_matches" ADD CONSTRAINT "app_ai_matches_pet1Id_fkey" FOREIGN KEY ("pet1Id") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_ai_matches" ADD CONSTRAINT "app_ai_matches_pet2Id_fkey" FOREIGN KEY ("pet2Id") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_conversations" ADD CONSTRAINT "app_conversations_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_conversations" ADD CONSTRAINT "app_conversations_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_messages" ADD CONSTRAINT "app_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "app_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_messages" ADD CONSTRAINT "app_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_health_records" ADD CONSTRAINT "app_health_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_subscriptions" ADD CONSTRAINT "app_user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_subscriptions" ADD CONSTRAINT "app_user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "app_subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_payments" ADD CONSTRAINT "app_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_gps_tracks" ADD CONSTRAINT "app_gps_tracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_gps_tracks" ADD CONSTRAINT "app_gps_tracks_petId_fkey" FOREIGN KEY ("petId") REFERENCES "app_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_analytics_events" ADD CONSTRAINT "app_analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_verification_codes" ADD CONSTRAINT "app_verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

