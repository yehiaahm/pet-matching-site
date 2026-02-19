# PetMate Improvements - Quick Implementation Guide

## 🚀 Quick Start - How to Use New Features

### Step 1: Add Onboarding to Your App

**In `src/app/App.tsx` or main entry point:**

```tsx
import { OnboardingProvider } from './context/OnboardingContext';
import { OnboardingFlow } from './components/OnboardingFlow';

function App() {
  return (
    <OnboardingProvider>
      <AuthProvider>
        {/* Your existing app components */}
        <YourMainApp />
        
        {/* Add this anywhere - shows modal when needed */}
        <OnboardingFlow />
      </AuthProvider>
    </OnboardingProvider>
  );
}
```

### Step 2: Use AI Matching in Pet Details

**In any component showing a pet:**

```tsx
import { useAIMatching } from '../hooks/useAIMatching';
import { AIRecommendations } from './AIRecommendations';

export function PetDetailsPage({ petId }) {
  const { fetchRecommendations } = useAIMatching();

  useEffect(() => {
    fetchRecommendations(petId);
  }, [petId]);

  return (
    <div>
      <h1>Pet Details</h1>
      
      {/* Add this component to show smart matches */}
      <AIRecommendations 
        petId={petId} 
        limit={5}
        onSelectMatch={(matchedPetId) => {
          // Handle sending breeding request
          console.log('Selected:', matchedPetId);
        }}
      />
    </div>
  );
}
```

### Step 3: Show Help Tooltips

**In any component that needs guidance:**

```tsx
import { useOnboarding } from '../context/OnboardingContext';
import { TOOLTIPS } from '../types/onboarding';

export function BreedingRequestButton() {
  const { showTooltip, hasSeenFeature, markFeatureSeen } = useOnboarding();

  useEffect(() => {
    if (!hasSeenFeature('breeding-request')) {
      showTooltip('breedingRequest');
      markFeatureSeen('breeding-request');
    }
  }, []);

  return (
    <Tooltip title={TOOLTIPS.breedingRequest}>
      <Button>Send Breeding Request</Button>
    </Tooltip>
  );
}
```

---

## 📊 Testing the Features

### Test 1: Onboarding Flow

```javascript
// In browser console:
localStorage.clear();
location.reload();
// Should see welcome modal
```

### Test 2: AI Matching

```javascript
// Login first, then try:
const token = localStorage.getItem('accessToken');

fetch('http://localhost:5000/api/v1/ai-matches/recommendations/pet-123', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log(d.data.recommendations))
```

### Test 3: Calculate Match Score

```javascript
const token = localStorage.getItem('accessToken');

fetch('http://localhost:5000/api/v1/ai-matches/calculate-score', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    petAId: 'pet-123',
    petBId: 'pet-456'
  })
})
.then(r => r.json())
.then(d => console.log('Score:', d.data.score))
```

---

## 🎯 What Each Component Does

| Component | Purpose | Location |
|-----------|---------|----------|
| `OnboardingProvider` | Global state for onboarding | `context/OnboardingContext.tsx` |
| `OnboardingFlow` | Modal guiding new users | `components/OnboardingFlow.tsx` |
| `useAIMatching` | Hook to fetch recommendations | `hooks/useAIMatching.ts` |
| `AIRecommendations` | Display matches UI | `components/AIRecommendations.tsx` |
| `aiMatchingController` | Backend API logic | `server/controllers/aiMatchingController.js` |
| `aiMatchingRoutes` | API endpoints | `server/routes/aiMatchingRoutes.js` |

---

## 🔧 Customization

### Change Onboarding Steps

Edit `OnboardingFlow.tsx` - `steps` array:

```tsx
const steps = [
  { id: 'welcome', title: 'Welcome!', description: '...' },
  // Add or remove steps here
];
```

### Adjust AI Match Weights

Edit `aiMatching.ts` - scoring weights:

```typescript
factors.push({
  category: 'Breed Compatibility',
  score: breedScore,
  weight: 0.2,  // <-- Change this (0.0 to 1.0)
  // ...
});
```

### Customize Tooltips

Edit `onboarding.ts` - `TOOLTIPS` object:

```typescript
export const TOOLTIPS = {
  yourFeature: 'Your custom tooltip text',
  // ...
};
```

---

## 🚨 Common Issues & Solutions

### Issue: Onboarding modal won't show
**Solution**: Check localStorage:
```javascript
localStorage.removeItem('petmate_onboarding');
location.reload();
```

### Issue: AI endpoints returning 404
**Solution**: Verify route is registered in `server/routes/index.js`:
```javascript
router.use(`${apiPrefix}/ai-matches`, aiMatchingRoutes);
```

### Issue: Recommendations showing no data
**Solution**: Check auth token in headers:
```javascript
console.log('Token:', localStorage.getItem('accessToken'));
```

### Issue: Styling looks off
**Solution**: Ensure Tailwind CSS is imported:
```tsx
import '../../styles/index.css';
```

---

## 📈 Performance Tips

1. **Cache recommendations** (24 hour expiry)
2. **Lazy load AI component** - only load when needed
3. **Paginate search results** - max 50 per page
4. **Use debouncing** for search filters

---

## 🎓 Production Checklist

- [ ] Update `package.json` version (new features)
- [ ] Add error boundary for AI component
- [ ] Test on mobile devices
- [ ] Add analytics tracking for recommendations
- [ ] Set up 404 page
- [ ] Document new APIs for frontend team
- [ ] Create unit tests for AI algorithm
- [ ] Load test new endpoints
- [ ] Update README.md
- [ ] Create migration guide for existing users

---

## 📚 File Structure

```
src/app/
├── components/
│   ├── OnboardingFlow.tsx         ✨ NEW
│   ├── AIRecommendations.tsx      ✨ NEW
│   └── [existing components]
├── context/
│   ├── OnboardingContext.tsx      ✨ NEW
│   └── [existing contexts]
├── hooks/
│   ├── useAIMatching.ts           ✨ NEW
│   └── [existing hooks]
├── types/
│   ├── onboarding.ts             ✨ NEW
│   └── [existing types]
└── utils/
    ├── aiMatching.ts             ✨ NEW
    └── [existing utils]

server/
├── controllers/
│   ├── aiMatchingController.js   ✨ NEW
│   └── [existing controllers]
├── routes/
│   ├── aiMatchingRoutes.js       ✨ NEW
│   └── [existing routes]
└── [existing structure]
```

---

## 🔐 Security Notes

✅ **All new endpoints require authentication** (Bearer token)

✅ **Role-based access**:
- Users can only see their own recommendations
- Admins can view system-wide analytics

✅ **No sensitive data exposed** in AI scores

✅ **Rate limiting** applies to all API endpoints

---

## 🚀 Next: Phase 3 - Pagination

Add pagination to existing list endpoints:

```javascript
// Example enhancement
export const getPets = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const [total, pets] = await Promise.all([
    prisma.pet.count(),
    prisma.pet.findMany({ skip, take: limit }),
  ]);
  
  return successResponse(res, 'Pets retrieved', {
    data: pets,
    pagination: { page, limit, total, pages: Math.ceil(total/limit) }
  });
};
```

---

**Questions?** Check `PETMATE_IMPROVEMENTS.md` for detailed architecture info.

**Last Updated**: January 12, 2026
