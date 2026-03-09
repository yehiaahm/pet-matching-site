# PETMAT Backend Production Architecture

## 1) Target Stack
- Runtime: Node.js 22+ (TypeScript recommended)
- Framework: Express
- DB: PostgreSQL 15+ (primary store)
- Cache/Realtime support: Redis 7+
- Auth: JWT (access + refresh), RBAC permissions
- Messaging: SQS/Kafka (async events)
- Files: AWS S3 + CloudFront
- Infra: AWS ECS/EKS + RDS PostgreSQL + ElastiCache Redis + ALB + WAF

## 2) High-Level Service Architecture

```text
React App / Mobile
      |
   API Gateway / ALB
      |
  Express API (stateless pods)
   |       |        |
PostgreSQL Redis   Queue (SQS/Kafka)
   |       |        |
 RDS   ElastiCache Workers (notifications, payments, media, analytics)

S3 (media) + CloudFront (delivery)
```

### Core principles
- Modular monolith first; split into microservices by traffic domain later.
- Strong transactional boundaries around checkout, booking, and payment.
- Event-driven async work using outbox pattern.
- Idempotent write APIs for payment/booking/order workflows.

## 3) Recommended Backend Folder Structure

```text
server/
  src/
    app.ts
    server.ts
    config/
      env.ts
      logger.ts
      db.ts
      redis.ts
      rateLimit.ts
      security.ts
      cors.ts
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.routes.ts
        auth.validation.ts
        jwt.service.ts
      users/
      pets/
      listings/
      products/
      cart/
      orders/
      payments/
      bookings/
      chat/
      notifications/
      reviews/
      admin/
      files/
      location/
    shared/
      middleware/
        auth.middleware.ts
        permission.middleware.ts
        error.middleware.ts
        requestId.middleware.ts
      utils/
      constants/
      types/
      dto/
    infra/
      queue/
      email/
      sms/
      push/
      storage/
      search/
    jobs/
      outbox.publisher.ts
      notifications.dispatcher.ts
      payment.webhook.processor.ts
      media.thumbnail.processor.ts
    db/
      migrations/
      seeds/
      queries/
  tests/
    unit/
    integration/
    e2e/
```

## 4) API Endpoint Structure (v1)

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Users / Profiles
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/:id`
- `GET /api/v1/users/:id/pets`
- `POST /api/v1/users/me/addresses`
- `GET /api/v1/users/me/addresses`

### Pets
- `POST /api/v1/pets`
- `GET /api/v1/pets/:id`
- `PATCH /api/v1/pets/:id`
- `DELETE /api/v1/pets/:id`
- `POST /api/v1/pets/:id/images`

### Marketplace Listings
- `POST /api/v1/listings`
- `GET /api/v1/listings`
- `GET /api/v1/listings/:id`
- `PATCH /api/v1/listings/:id`
- `POST /api/v1/listings/:id/favorite`
- `POST /api/v1/listings/:id/inquiries`

### Products / Store
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products` (seller/admin)
- `PATCH /api/v1/products/:id`
- `POST /api/v1/products/:id/images`

### Cart / Orders / Payments
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:itemId`
- `DELETE /api/v1/cart/items/:itemId`
- `POST /api/v1/orders`
- `GET /api/v1/orders/:id`
- `GET /api/v1/orders`
- `POST /api/v1/payments/intent`
- `POST /api/v1/payments/webhook` (provider signed webhook)
- `POST /api/v1/payments/:paymentId/refund` (admin/support)

### Bookings
- `POST /api/v1/services`
- `GET /api/v1/services`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings`
- `PATCH /api/v1/bookings/:id/confirm`
- `PATCH /api/v1/bookings/:id/cancel`
- `PATCH /api/v1/bookings/:id/complete`

### Chat
- `POST /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:id/messages`
- `POST /api/v1/chat/conversations/:id/messages`
- `PATCH /api/v1/chat/messages/:id`

### Notifications
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`
- `PATCH /api/v1/notifications/preferences`

### Reviews
- `POST /api/v1/reviews`
- `GET /api/v1/reviews`
- `PATCH /api/v1/reviews/:id`

### Admin
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/status`
- `GET /api/v1/admin/cases`
- `POST /api/v1/admin/cases/:id/notes`
- `PATCH /api/v1/admin/cases/:id/resolve`
- `GET /api/v1/admin/audit-logs`
- `PATCH /api/v1/admin/feature-flags/:key`

## 5) Auth System Design (JWT + Redis)

### Token model
- Access token (JWT): short TTL (10-15 min), signed with rotating key (`kid` header).
- Refresh token: opaque random token, hashed in DB (`sessions.refresh_token_hash`).
- Rotation: every refresh issues new access + refresh pair; old refresh revoked.

### Security controls
- Store refresh token in httpOnly secure cookie.
- Access token in memory client-side; avoid localStorage when possible.
- Rate-limit auth endpoints in Redis.
- Account lock policy after repeated failures.
- Optional MFA table for TOTP/WebAuthn in phase 2.

### Authorization
- RBAC from `roles`, `permissions`, `user_roles`, `role_permissions`.
- Middleware chain: `authenticateJWT` -> `requirePermission('orders.manage')`.

## 6) Admin Panel Backend Structure

### Domains
- User moderation (suspend/reactivate)
- Listing moderation (approve/hide)
- Order/payment oversight (refunds/disputes)
- Case management (`admin_cases`, `admin_notes`)
- Platform operations (feature flags, audit logs)

### Guardrails
- All admin actions write to `audit_logs`.
- `super_admin` only for destructive operations.
- Immutable payment event history (`payment_events`).

## 7) Chat + Notification System

### Chat
- Primary write/read in PostgreSQL (`conversations`, `messages`).
- Redis used for presence, typing indicators, recent unread counters.
- Realtime transport: WebSocket gateway (Socket.IO) separate process if needed.

### Notifications
- Notification producer from domain events (order paid, booking confirmed, new message).
- Outbox -> queue -> workers -> channel providers (email/push/sms/in-app).
- Retry policy with dead-letter queue for failed sends.

## 8) Payment Integration Structure

### Provider abstraction
- `payments/provider.interface.ts`
- `payments/providers/stripe.provider.ts`
- `payments/providers/paymob.provider.ts`

### Workflow
1. `POST /payments/intent` creates pending payment + idempotency key.
2. Provider completes payment externally.
3. Signed webhook updates `payments` + appends `payment_events`.
4. Order status transition in single DB transaction.
5. Emit outbox event for notifications and analytics.

### Required controls
- Verify provider signatures.
- Idempotent webhook handling (`provider_event_id` unique).
- Never trust client-side payment status.

## 9) Redis Caching Strategy

### Cache keys
- `product:{id}`, `listing:{id}`, `user_profile:{id}`
- `feed:listings:{city}:{page}`
- `perm:user:{id}`

### Policies
- TTL: 1-10 minutes for catalog/feed data.
- Invalidate on writes via event handlers.
- Use Redis for distributed locks in critical jobs.

## 10) Scalability Plan (Millions of Users)

### Database scaling
- Primary + read replicas.
- PgBouncer for pooling.
- Partition high-growth tables by time (`messages`, `notifications`, `audit_logs`, `payment_events`).
- Use covering indexes for top queries.

### API scaling
- Stateless containers, autoscaling on CPU/RPS.
- Separate worker autoscaling by queue depth.
- Global CDN + edge caching for media.

### Reliability
- SLO-driven observability: p95 latency, error rate, queue lag, DB saturation.
- OpenTelemetry tracing + centralized logs.
- Blue/green deploys with zero-downtime migrations.

## 11) Initial Migration Pack
- Primary schema SQL file: `database/migrations/20260227_001_petmat_core_schema.sql`
- Includes:
  - Auth, RBAC, users, pets, marketplace, products, carts/orders, payments, bookings
  - Chat/messages, notifications, reviews, admin moderation, audit logs
  - Outbox and idempotency infrastructure for event-driven reliability
  - Production indexes and update triggers

## 12) Suggested Next Migrations
- `20260227_002_partition_messages_notifications.sql`
- `20260227_003_search_indexes_pg_trgm.sql`
- `20260227_004_seed_admin_permissions.sql`
- `20260227_005_row_level_security_policies.sql`

