# PETMAT Backend

## Stack
- Node.js + Express
- PostgreSQL
- Prisma ORM
- Socket.io
- JWT auth
- Cloudinary

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps:
   - `npm install`
3. Prisma:
   - `npm run prisma:generate`
   - `npx prisma migrate dev --name init`
4. Start server:
   - `npm run dev`

## Security & Validation (Production Ready)
- Helmet headers enabled.
- API rate limiting enabled.
- Request validation is enforced with Zod on all core routes.
- Record-level authorization is enforced for match/chat/health/ai resources.
- Marketplace seller commission is controlled by `MARKETPLACE_COMMISSION_PERCENT` (default: `10`).
- Configure CORS with `CORS_ORIGINS` in `.env` (comma-separated), example:
   - `CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com`

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Pets
- `POST /api/pets/add`
- `GET /api/pets/my`
- `GET /api/pets/all`
- `GET /api/pets/:id`
- `DELETE /api/pets/:id`

### Matching
- `POST /api/match/send`
- `POST /api/match/accept/:id`
- `POST /api/match/reject/:id`
- `GET /api/ai/match/:petId`

### Chat
- `POST /api/chat/start`
- `POST /api/chat/send`
- `GET /api/chat/list`
- `GET /api/chat/:conversationId`

### Health
- `POST /api/health/add`
- `GET /api/health/:petId`
- `DELETE /api/health/:id`

### Payments & Subscription
- `POST /api/payment/upload`
- `POST /api/subscription/activate`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/pets`
- `GET /api/admin/payments`
- `POST /api/admin/verify-user`
- `POST /api/admin/ban`
- `POST /api/admin/payment/confirm`

### Marketplace
- `GET /api/marketplace/categories`
- `POST /api/marketplace/seller/become`
- `GET /api/marketplace/seller/me`
- `GET /api/marketplace/seller/products`
- `GET /api/marketplace/seller/orders`
- `GET /api/marketplace/products`
- `GET /api/marketplace/products/:id`
- `POST /api/marketplace/products`
- `PATCH /api/marketplace/products/:id`
- `DELETE /api/marketplace/products/:id`
- `GET /api/marketplace/cart`
- `POST /api/marketplace/cart/items`
- `PATCH /api/marketplace/cart/items/:id`
- `DELETE /api/marketplace/cart/items/:id`
- `DELETE /api/marketplace/cart`
- `POST /api/marketplace/orders/checkout`
- `GET /api/marketplace/orders/my`
- `GET /api/marketplace/orders/:id`
- `PATCH /api/marketplace/orders/:id/status`

## Socket Events
- Join room: `chat:join` with `conversationId`
- Outgoing event on send: `chat:new_message`
