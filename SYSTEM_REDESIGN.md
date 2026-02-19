# 🏗️ System Redesign - Production Architecture

## Overview
This document outlines the complete redesign addressing 4 critical issues:
1. Navigation & User Flow
2. Subscription & Payment System
3. Single Clinic Architecture
4. Booking System

---

## 1️⃣ Navigation & User Flow Fix

### Problem Analysis
- Users get lost in deep navigation
- No consistent way to return home
- Missing global navigation
- Dead-end pages exist

### Solution Architecture

#### Persistent Navigation Component
```tsx
<Layout>
  <TopNavBar>
    - Logo (clickable → Home)
    - Search
    - Notifications
    - User Menu
      - Dashboard
      - My Pets
      - Requests
      - Health Records
      - Bookings (NEW)
      - Subscription (NEW)
      - Logout
  </TopNavBar>
  
  <MainContent>
    {children}
  </MainContent>
  
  <MobileBottomNav> (responsive)
    - Home
    - Browse
    - Requests
    - Profile
  </MobileBottomNav>
</Layout>
```

#### Route Protection
```tsx
// Route Structure
/                          → Home (Public)
/browse                    → Pet Browsing (Public)
/login                     → Login (Public)
/register                  → Register (Public)

/dashboard                 → Dashboard (Protected)
/my-pets                   → My Pets (Protected)
/requests                  → Breeding Requests (Protected)
/health-records            → Health Records (Protected)
/bookings                  → Clinic Bookings (Protected) ✨ NEW
/subscription              → Subscription Management (Protected) ✨ NEW
/messages                  → Messages (Protected)

/admin/*                   → Admin Panel (Admin Only)
```

#### Breadcrumb System
```tsx
Dashboard > My Pets > Pet Details > Health Records
[Home] > [My Pets] > [Max (Golden Retriever)] > [Health Records]
```

---

## 2️⃣ Subscription & Payment System

### Subscription Tiers

#### Free Tier
- Max 1 active pet listing
- View other pets (unlimited)
- Receive breeding requests (3/month)
- Send breeding requests (1/month)
- Basic messaging
- Standard listing visibility

#### Premium Tier ($19.99/month)
- Max 5 active pet listings
- Unlimited breeding requests (send/receive)
- Priority listing (appears first in search)
- Advanced messaging features
- Verified badge
- Analytics dashboard
- Clinic booking discount (10%)

### Database Schema

```prisma
enum SubscriptionTier {
  FREE
  PREMIUM
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PAYMENT_FAILED
}

model Subscription {
  id                String              @id @default(uuid())
  userId            String              @unique
  user              User                @relation(fields: [userId], references: [id])
  
  tier              SubscriptionTier    @default(FREE)
  status            SubscriptionStatus  @default(ACTIVE)
  
  // Payment info
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  stripePriceId         String?
  
  // Dates
  startDate         DateTime            @default(now())
  currentPeriodStart DateTime?
  currentPeriodEnd  DateTime?
  cancelAt          DateTime?
  cancelledAt       DateTime?
  
  // Usage tracking
  petsListedCount   Int                 @default(0)
  requestsSentCount Int                 @default(0)
  requestsSentMonth String?             // "2026-01"
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  @@map("subscriptions")
}

// Add to User model
model User {
  // ... existing fields
  subscription      Subscription?
  subscriptionTier  SubscriptionTier    @default(FREE)
}
```

### Subscription Middleware

```typescript
// Check subscription limits
export const checkSubscriptionLimit = async (userId: string, action: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });
  
  const limits = {
    FREE: {
      maxPets: 1,
      maxRequestsPerMonth: 1,
      canSendRequests: true
    },
    PREMIUM: {
      maxPets: 5,
      maxRequestsPerMonth: 999,
      canSendRequests: true
    }
  };
  
  const tier = subscription?.tier || 'FREE';
  const limit = limits[tier];
  
  switch (action) {
    case 'ADD_PET':
      return subscription.petsListedCount < limit.maxPets;
    case 'SEND_REQUEST':
      return subscription.requestsSentCount < limit.maxRequestsPerMonth;
  }
};
```

### API Endpoints

```typescript
POST   /api/v1/subscriptions/upgrade          // Upgrade to premium
POST   /api/v1/subscriptions/cancel           // Cancel subscription
GET    /api/v1/subscriptions/status           // Get current status
POST   /api/v1/subscriptions/checkout         // Create Stripe checkout
POST   /api/v1/webhooks/stripe                // Stripe webhook handler

// Usage checks
POST   /api/v1/subscriptions/check-limit      // Check if action allowed
GET    /api/v1/subscriptions/usage            // Get usage statistics
```

---

## 3️⃣ Single Clinic Architecture

### Business Requirements
- ONE official clinic owned by the platform
- All veterinary services go through this clinic
- Admin manages the clinic
- No user-owned clinics

### Database Schema Changes

```prisma
// Single Clinic Entity
model Clinic {
  id                String    @id @default(uuid())
  name              String    // "PetMat Official Veterinary Clinic"
  description       String?   @db.Text
  
  // Contact Info
  phone             String
  email             String
  address           String
  city              String
  country           String
  
  // Operating Hours
  operatingHours    Json      // { monday: "9:00-17:00", ... }
  
  // Services
  services          ClinicService[]
  bookings          ClinicBooking[]
  
  // Status
  isActive          Boolean   @default(true)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@map("clinic")
}

enum ServiceType {
  HEALTH_CHECKUP
  VACCINATION
  GENETIC_TEST
  MICROCHIP
  CERTIFICATION
  EMERGENCY
}

model ClinicService {
  id                String      @id @default(uuid())
  clinicId          String
  clinic            Clinic      @relation(fields: [clinicId], references: [id])
  
  type              ServiceType
  name              String
  description       String?     @db.Text
  duration          Int         // minutes
  price             Float
  
  // Availability
  isActive          Boolean     @default(true)
  
  bookings          ClinicBooking[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@map("clinic_services")
}

enum BookingStatus {
  PENDING           // User created, awaiting confirmation
  CONFIRMED         // Admin confirmed, slot reserved
  IN_PROGRESS       // Service being performed
  COMPLETED         // Service completed
  CANCELLED_USER    // Cancelled by user
  CANCELLED_ADMIN   // Cancelled by admin
  NO_SHOW          // User didn't show up
}

model ClinicBooking {
  id                String        @id @default(uuid())
  
  // Single Clinic Reference
  clinicId          String
  clinic            Clinic        @relation(fields: [clinicId], references: [id])
  
  // Service
  serviceId         String
  service           ClinicService @relation(fields: [serviceId], references: [id])
  
  // Pet & Owner
  petId             String
  pet               Pet           @relation(fields: [petId], references: [id])
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  
  // Booking Details
  bookingDate       DateTime
  timeSlot          String        // "09:00-10:00"
  status            BookingStatus @default(PENDING)
  
  // Notes
  userNotes         String?       @db.Text
  adminNotes        String?       @db.Text
  
  // Result
  certificate       String?       // URL to certificate after completion
  resultNotes       String?       @db.Text
  
  // Metadata
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  completedAt       DateTime?
  cancelledAt       DateTime?
  
  @@unique([clinicId, bookingDate, timeSlot])
  @@index([userId])
  @@index([petId])
  @@index([status])
  @@index([bookingDate])
  @@map("clinic_bookings")
}

// Add to Pet model
model Pet {
  // ... existing fields
  clinicBookings    ClinicBooking[]
}

// Add to User model
model User {
  // ... existing fields
  clinicBookings    ClinicBooking[]
}
```

### Clinic Initialization (Seed Data)

```typescript
// server/prisma/seed.js
const clinic = await prisma.clinic.create({
  data: {
    name: "PetMat Official Veterinary Clinic",
    description: "Professional veterinary services for all your pet breeding needs",
    phone: "+20-100-000-0000",
    email: "clinic@petmat.com",
    address: "123 Main Street",
    city: "Cairo",
    country: "Egypt",
    operatingHours: {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-14:00",
      saturday: "10:00-15:00",
      sunday: "CLOSED"
    },
    isActive: true
  }
});

// Create services
const services = [
  {
    type: "HEALTH_CHECKUP",
    name: "Complete Health Checkup",
    description: "Comprehensive health examination",
    duration: 30,
    price: 300
  },
  {
    type: "VACCINATION",
    name: "Vaccination Service",
    description: "All standard pet vaccinations",
    duration: 20,
    price: 150
  },
  {
    type: "GENETIC_TEST",
    name: "Genetic Testing",
    description: "DNA analysis for breeding compatibility",
    duration: 45,
    price: 800
  },
  {
    type: "CERTIFICATION",
    name: "Breeding Certification",
    description: "Official breeding certification",
    duration: 30,
    price: 400
  }
];

for (const service of services) {
  await prisma.clinicService.create({
    data: { ...service, clinicId: clinic.id }
  });
}
```

---

## 4️⃣ Booking System Redesign

### Booking Flow

```
1. User selects pet
   ↓
2. User browses available services
   ↓
3. User selects service
   ↓
4. System shows available time slots
   ↓
5. User selects date & time
   ↓
6. User adds notes (optional)
   ↓
7. User confirms booking
   ↓
8. Booking created (PENDING status)
   ↓
9. Admin reviews and confirms
   ↓
10. Booking confirmed (CONFIRMED status)
    ↓
11. User attends appointment
    ↓
12. Admin marks as completed
    ↓
13. Certificate/results generated
```

### Slot Management

```typescript
// Generate available slots
function generateAvailableSlots(date: Date, service: ClinicService) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const hours = clinic.operatingHours[dayOfWeek]; // "09:00-17:00"
  
  if (hours === "CLOSED") return [];
  
  const [startTime, endTime] = hours.split('-');
  const slots = [];
  
  // Generate slots based on service duration
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  
  while (current < end) {
    const slotEnd = addMinutes(current, service.duration);
    if (slotEnd <= end) {
      slots.push({
        start: formatTime(current),
        end: formatTime(slotEnd),
        available: true
      });
    }
    current = slotEnd;
  }
  
  // Mark booked slots as unavailable
  const bookings = await prisma.clinicBooking.findMany({
    where: {
      bookingDate: date,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
    }
  });
  
  bookings.forEach(booking => {
    const slot = slots.find(s => s.start === booking.timeSlot.split('-')[0]);
    if (slot) slot.available = false;
  });
  
  return slots;
}
```

### Booking Rules & Validation

```typescript
// Booking validation
async function validateBooking(data) {
  const { clinicId, serviceId, bookingDate, timeSlot, petId, userId } = data;
  
  // 1. Check if slot is still available
  const existingBooking = await prisma.clinicBooking.findUnique({
    where: {
      clinicId_bookingDate_timeSlot: {
        clinicId,
        bookingDate,
        timeSlot
      }
    }
  });
  
  if (existingBooking) {
    throw new Error('Time slot no longer available');
  }
  
  // 2. Check if booking is in the future
  if (new Date(bookingDate) < new Date()) {
    throw new Error('Cannot book past dates');
  }
  
  // 3. Check if user owns the pet
  const pet = await prisma.pet.findUnique({
    where: { id: petId }
  });
  
  if (pet.ownerId !== userId) {
    throw new Error('You can only book for your own pets');
  }
  
  // 4. Check for duplicate active bookings
  const activeBookings = await prisma.clinicBooking.count({
    where: {
      petId,
      serviceId,
      status: { in: ['PENDING', 'CONFIRMED'] }
    }
  });
  
  if (activeBookings > 0) {
    throw new Error('Pet already has an active booking for this service');
  }
  
  return true;
}
```

### Cancellation Policy

```typescript
// Cancellation rules
function canCancelBooking(booking: ClinicBooking) {
  const now = new Date();
  const bookingTime = new Date(booking.bookingDate);
  const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Can cancel if:
  // 1. Status is PENDING or CONFIRMED
  // 2. At least 24 hours before appointment
  
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return { allowed: false, reason: 'Booking cannot be cancelled in current status' };
  }
  
  if (hoursUntilBooking < 24) {
    return { allowed: false, reason: 'Must cancel at least 24 hours in advance' };
  }
  
  return { allowed: true };
}
```

### API Endpoints

```typescript
// Booking endpoints
GET    /api/v1/clinic/info                    // Get clinic information
GET    /api/v1/clinic/services                // Get available services
GET    /api/v1/clinic/slots/:serviceId        // Get available time slots
POST   /api/v1/bookings                       // Create booking
GET    /api/v1/bookings                       // Get user's bookings
GET    /api/v1/bookings/:id                   // Get booking details
PATCH  /api/v1/bookings/:id/cancel            // Cancel booking
POST   /api/v1/bookings/:id/reschedule        // Reschedule booking

// Admin endpoints
GET    /api/v1/admin/bookings                 // Get all bookings
PATCH  /api/v1/admin/bookings/:id/confirm     // Confirm booking
PATCH  /api/v1/admin/bookings/:id/complete    // Complete booking
PATCH  /api/v1/admin/bookings/:id/cancel      // Admin cancel
POST   /api/v1/admin/clinic/schedule          // Manage clinic schedule
```

---

## 🎨 UX Best Practices

### Navigation UX
1. **Always Visible Home Button**: Logo in top-left always returns to home
2. **User Menu**: Easy access to all user functions
3. **Active State**: Highlight current page in navigation
4. **Mobile-First**: Bottom navigation for mobile devices
5. **Breadcrumbs**: Show navigation path for complex flows

### Booking UX
1. **Visual Calendar**: Show availability clearly
2. **Slot Selection**: Clear visual indication of available/booked slots
3. **Confirmation Screen**: Summary before final booking
4. **Email Notifications**: Confirmation, reminders, status changes
5. **Easy Cancellation**: Clear cancellation button with policy
6. **Booking History**: Easy access to past bookings
7. **Status Indicators**: Clear visual status (pending/confirmed/completed)

### Subscription UX
1. **Clear Feature Comparison**: Side-by-side tier comparison
2. **Usage Indicators**: Show current usage vs. limits
3. **Upgrade Prompts**: Gentle nudges when hitting limits
4. **Grace Period**: Don't immediately block features on expiry
5. **Easy Downgrade**: Allow switching back to free tier
6. **Transparent Pricing**: No hidden fees

---

## 🔄 Migration Strategy

### Phase 1: Database Migration
1. Add subscription tables
2. Add single clinic table
3. Add clinic services table
4. Add clinic bookings table
5. Remove multi-clinic references
6. Run migrations

### Phase 2: Backend Implementation
1. Implement subscription middleware
2. Implement booking validation
3. Implement slot management
4. Update existing APIs to check subscriptions
5. Create new clinic/booking APIs
6. Setup Stripe webhook handlers

### Phase 3: Frontend Implementation
1. Create persistent navigation component
2. Create subscription management page
3. Create booking flow components
4. Create clinic information page
5. Update protected routes
6. Add subscription checks in UI
7. Add breadcrumb navigation

### Phase 4: Testing & Deployment
1. Test all user flows
2. Test payment integration
3. Test booking system
4. Test subscription limits
5. Load testing
6. Deploy to staging
7. User acceptance testing
8. Deploy to production

---

## 📊 Success Metrics

### Navigation
- Time to return home: < 2 seconds
- Navigation confusion rate: < 5%
- Dead-end page encounters: 0

### Subscription
- Free-to-Premium conversion: > 10%
- Payment success rate: > 95%
- Subscription retention: > 80%

### Booking
- Booking completion rate: > 85%
- Double booking incidents: 0
- Cancellation rate: < 15%
- User satisfaction: > 4.5/5

---

## 🔐 Security Considerations

### Subscription
- Verify Stripe webhooks signature
- Prevent subscription bypass
- Secure payment data (PCI compliance)
- Rate limit subscription checks

### Booking
- Prevent slot hijacking (race conditions)
- Validate pet ownership
- Secure booking cancellation
- Admin-only status changes

### Navigation
- Proper route protection
- Session validation
- CSRF protection
- XSS prevention

---

This redesign provides a solid foundation for a production-ready platform with clear business logic, user-friendly UX, and scalable architecture.
