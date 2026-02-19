# PetMate Layered Architecture - Complete Example

This document shows the complete implementation pattern for the PetMate backend layered architecture.

## 🎯 Complete Implementation Example

### 1. **Controller-Service-Repository Pattern**

#### **Controller Layer** (`src/controllers/pet.controller.ts`)
```typescript
export class PetController implements IPetController {
  constructor(private petService: IPetService) {}

  async createPet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = await validatePetCreation(req.body);

      // Call service layer
      const pet = await this.petService.createPet(validatedData, req.user!.id);

      // Send response
      sendSuccess(res, 201, {
        message: 'Pet created successfully',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

#### **Service Layer** (`src/services/pet.service.ts`)
```typescript
export class PetService implements IPetService {
  constructor(private petRepository: IPetRepository) {}

  async createPet(data: PetCreateInput, ownerId: string): Promise<any> {
    // Business logic validation
    await this.validatePetData(data, ownerId);

    // Calculate derived fields
    const petData = {
      ...data,
      ownerId,
      breedingStatus: 'AVAILABLE',
      age: this.calculateAge(data.dateOfBirth),
    };

    // Call repository layer
    return await this.petRepository.create(petData);
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
```

#### **Repository Layer** (`src/repositories/pet.repository.ts`)
```typescript
export class PetRepository extends BaseRepository<Pet, string> implements IPetRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.pet);
  }

  async create(data: Partial<Pet>): Promise<Pet> {
    return await this.model.create({ data });
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    return await this.model.findMany({
      where: { ownerId },
      include: {
        vaccinations: true,
        healthChecks: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 2. **Route Definition** (`src/routes/pet.routes.ts`)
```typescript
export function createPetRoutes(petService: IPetService): Router {
  const router = Router();
  const petController = createPetController(petService);

  // Validation rules
  const createPetValidation = [
    body('name').trim().notEmpty().withMessage('Pet name is required'),
    body('species').isIn(['DOG', 'CAT', 'BIRD']).withMessage('Invalid species'),
    // ... more validations
  ];

  // Route definition
  router.post(
    '/',
    authenticate,
    rateLimit({ max: 5, windowMs: 60000 }),
    createPetValidation,
    validate,
    petController.createPet.bind(petController)
  );

  return router;
}
```

### 3. **Middleware Usage**
```typescript
// In main app setup
app.use('/api/v1/pets', createPetRoutes(petService));
```

## 🔄 Data Flow Example

### **Request Flow**
```
HTTP Request → Route → Middleware → Controller → Service → Repository → Database
   ↑                                                      ↓
Response ← Controller ← Service ← Repository ← Database
```

### **Example: Create Pet Request**
```typescript
// 1. Route receives POST /api/v1/pets
router.post('/', authenticate, createPetValidation, validate, petController.createPet);

// 2. Controller validates and calls service
async createPet(req, res, next) {
  const pet = await this.petService.createPet(req.body, req.user.id);
  sendSuccess(res, 201, { data: pet });
}

// 3. Service validates and calls repository
async createPet(data, ownerId) {
  this.validatePetData(data, ownerId);
  const petData = { ...data, ownerId, breedingStatus: 'AVAILABLE' };
  return await this.petRepository.create(petData);
}

// 4. Repository performs database operation
async create(data) {
  return await this.model.create({ data });
}
```

## 🏗️ Folder Structure Implementation

### **Complete Directory Structure**
```
backend/
├── src/
│   ├── controllers/
│   │   ├── pet.controller.ts
│   │   ├── auth.controller.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── pet.service.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── base.repository.ts
│   ├── pet.repository.ts
│   │   ├── user.repository.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── pet.routes.ts
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── index.ts
│   ├── utils/
│   ├── response.util.ts
│   ├── logger.util.ts
│   ├── validation.util.ts
│   └── index.ts
│   ├── types/
│   ├── pet.types.ts
│   ├── auth.types.ts
│   ├── api.types.ts
│   └── index.ts
│   ├── validators/
│   ├── pet.validator.ts
│   ├── auth.validator.ts
│   └── index.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔧 Dependency Injection Pattern

### **Service Factory**
```typescript
// In main app file
import { PetService } from './services/pet.service';
import { PetRepository } from './repositories/pet.repository';
import { PrismaClient } from '@prisma/client';

// Create dependencies
const prisma = new PrismaClient();
const petRepository = new PetRepository(prisma);
const petService = new PetService(petRepository);

// Create controller with dependencies
const petController = createPetController(petService);

// Create routes with dependencies
const petRoutes = createPetRoutes(petService);
```

### **DI Container (Advanced)**
```typescript
class DIContainer {
  private services = new Map();
  private repositories = new Map();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory());
  }

  get<T>(name: string): T {
    return this.services.get(name) as T;
  }

  // Singleton pattern for database connection
  getPrisma(): PrismaClient {
    if (!this.repositories.has('prisma')) {
      this.repositories.set('prisma', new PrismaClient());
    }
    return this.repositories.get('prisma') as PrismaClient;
  }
}
```

## 🧪 Validation Pattern

### **Input Validation**
```typescript
// Validator function
export const validatePetCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Pet name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Pet name must be between 2 and 50 characters'),
  
  body('species')
    .isIn(['DOG', 'CAT', 'BIRD'])
    .withMessage('Invalid species'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      return date <= new Date();
    })
    .withMessage('Date cannot be in the future'),
];

// Validation middleware
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }
  
  next();
}
```

## 🚀 Error Handling Pattern

### **Custom Error Classes**
```typescript
export class PetNotFoundError extends Error {
  constructor(petId: string) {
    super(`Pet with ID ${petId} not found`);
    this.name = 'PetNotFoundError';
  }
}

export class PetValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'PetValidationError';
  }
}
```

### **Error Middleware**
```typescript
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof PetNotFoundError) {
      return sendNotFound(res, error.message);
  }
  
  if (error instanceof PetValidationError) {
      return sendValidationError(res, [error.field || 'validation'], error.message);
  }
  
  if (error instanceof Error) {
      return sendInternalServerError(res, error.message);
  }
  
  next(error);
}
```

## 📊 Response Pattern

### **Standardized Responses**
```typescript
// Success response
sendSuccess(res, 200, {
  message: 'Pet retrieved successfully',
  data: pet,
});

// Error response
sendError(res, 404, 'Pet not found');

// Paginated response
sendPaginated(res, {
  data: pets,
  total: 100,
  page: 1,
  limit: 10,
  totalPages: 10,
  hasNext: true,
  hasPrev: false,
});
```

## 🔒 Testing Pattern

### **Unit Test Example**
```typescript
// Repository Test
describe('PetRepository', () => {
  let repository: PetRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PetRepository(prisma);
  });

  it('should create a pet', async () => {
    const petData = {
      name: 'Test Pet',
      species: 'DOG',
      breed: 'Golden Retriever',
      gender: 'MALE',
      dateOfBirth: new Date('2020-01-01'),
      ownerId: 'user-1',
    };

    const pet = await repository.create(petData);
    
    expect(pet.name).toBe('Test Pet');
    expect(pet.species).toBe('DOG');
  });
});
```

### **Service Test Example**
```typescript
// Service Test
describe('PetService', () => {
  let petService: PetService;
  let mockRepository: jest.Mocked<IPetRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwner: jest.fn(),
    } as jest.Mocked<IPetRepository>;
    
    petService = new PetService(mockRepository);
  });

  it('should validate pet data before creation', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
      species: 'INVALID', // Invalid: invalid species
      breed: 'Test',
      gender: 'INVALID', // Invalid: invalid gender
      dateOfBirth: new Date('invalid'), // Invalid: invalid date
      ownerId: 'user-1',
    };

    await expect(petService.createPet(invalidData, 'user-1')).rejects.toThrow('Pet name is required');
  });
});
```

### **Controller Test Example**
```typescript
// Controller Test
describe('PetController', () => {
  let petService: jest.Mocked<IPetService>;
  let controller: PetController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    petService = {
      createPet: jest.fn(),
      getPetById: jest.fn(),
      getUserPets: jest.fn(),
    } as jest.Mocked<IPetService>;
    
    controller = new PetController(petService);
    
    req = {
      user: { id: 'user-1' },
      body: {},
    };
    
    res = {
      status: jest.fn(),
      json: jest.fn(),
    };
  });

  it('should create a pet successfully', async () => {
    const petData = { name: 'Test Pet', species: 'DOG', breed: 'Test Breed', gender: 'MALE', dateOfBirth: '2020-01-01', ownerId: 'user-1' };
    
    petService.createPet.mockResolvedValue(petData);
    
    await controller.createPet(req as Request, res as Response, jest.fn());
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Pet created successfully',
      data: petData,
    });
  });
});
```

## 🎯 Benefits of This Architecture

### **1. Separation of Concerns**
- **Controllers**: Only handle HTTP concerns
- **Services**: Only handle business logic
- **Repositories**: Only handle data access
- **Routes**: Only define API contracts

### **2. Testability**
- Each layer can be unit tested independently
- Mock dependencies easily
- Clear test boundaries

### **3. Maintainability**
- Easy to locate and fix bugs
- Clear code organization
- Reduced coupling between layers

### **4. Scalability**
- Easy to add new features
- Simple to replace implementations
- Clear extension points

### **5. Reusability**
- Common patterns in base classes
- Shared utilities across layers
- Consistent interfaces

## 🚀 Implementation Checklist

### **Phase 1: Base Infrastructure**
- [x] Create base repository class
- [x] Create response utilities
- [x] Create logger utility
- [x] Create error handling middleware

### **Phase 2: Types and Interfaces**
- [x] Define all TypeScript interfaces
- [x] Create custom error classes
- [x] Create validation schemas
- [x] Create API response types

### **Phase 3: Repository Layer**
- [x] Implement base repository
- [x] Create specific repositories
- [x] Add query helpers
- [x] Add transaction support

### **Phase 4: Service Layer**
- [x] Implement business logic
- [x] Add validation rules
- [x] Add calculation helpers
- [x] Add transaction management

### **Phase 5: Controller Layer**
- [x] Implement request handlers
- [x] Add input validation
- [x] Add response formatting
- [x] Add error handling

### **Phase 6: Route Layer**
- [x] Define route definitions
- [x] Add middleware application
- [  ] Add validation rules
- [  ] Add rate limiting

### **Phase 7: Integration**
- [x] Wire up dependency injection
- [x] Create main app setup
- [x] Add middleware stack
- [  ] Add route registration

### **Phase 8: Testing**
- [x] Unit tests for repositories
- [x] Unit tests for services
- [x] Unit tests for controllers
- [x] Integration tests

## 🔧 Migration Steps

### **From Current to Layered Architecture**

1. **Backup Current Code**
```bash
cp -r src/ controllers src/controllers-backup
cp -r src/services src/services-backup
cp -r src/routes src/routes-backup
```

2. **Create Base Infrastructure**
```bash
mkdir -p src/repositories
mkdir -p src/utils
mkdir - src/types
mkdir - src/validators
mkdir - src/middleware
```

3. **Implement Base Classes**
```bash
# Create base repository
touch src/repositories/base.repository.ts
# Create response utilities
touch src/utils/response.util.ts
# Create logger utility
touch src/utils/logger.util.ts
```

4. **Implement Layer by Layer**
```bash
# Start with repositories
touch src/repositories/pet.repository.ts

# Then services
touch src/services/pet.service.ts

# Then controllers
touch src/controllers/pet.controller.ts

# Then routes
touch src/routes/pet.routes.ts
```

5. **Wire Everything Together**
```bash
# Update main app file
touch src/app.ts

# Create dependency injection
touch src/di/index.ts
```

6. **Test and Refactor**
```bash
# Run tests
npm test

# Fix any issues
npm run build
```

This layered architecture provides a solid foundation for your PetMate backend that's maintainable, testable, and scalable! 🚀
