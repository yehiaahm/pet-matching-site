# TanStack Query Migration Guide

## 🎯 Overview

This guide shows how to convert your existing `useEffect + fetch` logic to TanStack Query (React Query) for better caching, refetching, and optimistic updates.

## 📦 Installation

First, install the required packages:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install -D @types/react
```

## 🚀 Setup

### 1. QueryClient Provider

Add the QueryProvider to your app root:

```tsx
// src/app/hooks/query-provider.tsx (already created)
import { QueryProvider } from './hooks/query-provider';

function App() {
  return (
    <QueryProvider>
      {/* Your app components */}
    </QueryProvider>
  );
}
```

### 2. Update main.tsx

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from './hooks/query-provider';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
```

## 🔄 Before vs After Comparison

### Before (useEffect + fetch)

```tsx
// ❌ Old approach with useEffect + fetch
function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/pets', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setPets(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const refetch = () => {
    fetchPets();
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
    </div>
  );
}
```

### After (TanStack Query)

```tsx
// ✅ New approach with TanStack Query
function PetList() {
  const { data: pets, isLoading, error, refetch } = usePets();

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {pets?.map(pet => <PetCard key={pet.id} pet={pet} />)}
    </div>
  );
}
```

## 🎯 Key Benefits

### 1. **Automatic Caching**
```tsx
// Data is cached automatically
const { data } = usePets(); // Cached for 5 minutes

// Manual cache control
const { data } = usePets({
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes in cache
});
```

### 2. **Background Refetching**
```tsx
// Refetch on window focus
const { data } = usePets({
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});

// Refetch on interval
const { data } = usePets({
  refetchInterval: 30000, // Every 30 seconds
});
```

### 3. **Optimistic Updates**
```tsx
function UpdatePetForm({ petId }) {
  const updatePet = useUpdatePet();

  const handleSubmit = async (petData) => {
    // Optimistic update happens automatically
    updatePet.mutate({ id: petId, ...petData });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. **Error Handling**
```tsx
const { data, error, isLoading } = usePets({
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
  onError: (error) => {
    toast.error('Failed to fetch pets');
  },
});
```

## 📚 Reusable Hooks

### Pets Hook

```tsx
// src/app/hooks/usePets-query.ts
import { usePets, useCreatePet, useUpdatePet, useDeletePet } from './hooks/usePets-query';

function PetList() {
  const { data: pets, isLoading, error } = usePets();
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const handleCreatePet = (petData) => {
    createPet.mutate(petData);
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {pets?.map(pet => (
        <PetCard
          key={pet.id}
          pet={pet}
          onUpdate={(updates) => updatePet.mutate({ id: pet.id, ...updates })}
          onDelete={() => deletePet.mutate(pet.id)}
        />
      ))}
    </div>
  );
}
```

### Chat Hook

```tsx
// src/app/hooks/useChat-query.ts
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useUnreadCount 
} from './hooks/useChat-query';

function ChatInterface() {
  const { data: conversations } = useConversations();
  const { data: messages, refetch } = useMessages(selectedConversation);
  const sendMessage = useSendMessage();
  const { data: unreadCount } = useUnreadCount({
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleSendMessage = (content) => {
    sendMessage.mutate({ conversationId: selectedConversation, content });
  };

  return (
    <div>
      <div>Unread: {unreadCount}</div>
      <ConversationList conversations={conversations} />
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
```

### User Profile Hook

```tsx
// src/app/hooks/useUser-query.ts
import { 
  useCurrentUserProfile, 
  useUpdateProfile, 
  useUploadAvatar 
} from './hooks/useUser-query';

function UserProfile() {
  const { data: profile, isLoading } = useCurrentUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const handleProfileUpdate = (updates) => {
    updateProfile.mutate(updates);
  };

  const handleAvatarUpload = (file) => {
    uploadAvatar.mutate(file);
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading profile...</div>
      ) : (
        <ProfileForm
          profile={profile}
          onUpdate={handleProfileUpdate}
          onAvatarUpload={handleAvatarUpload}
        />
      )}
    </div>
  );
}
```

## 🔧 Advanced Features

### 1. **Infinite Scrolling**

```tsx
import { useInfinitePets } from './hooks/usePets-query';

function InfinitePetList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePets({ limit: 20 });

  return (
    <div>
      {data?.pages.map((page) => (
        <div key={page.nextPage}>
          {page.data.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
```

### 2. **Prefetching**

```tsx
import { usePrefetchPet } from './hooks/usePets-query';

function PetCard({ pet }) {
  const prefetchPet = usePrefetchPet();

  const handleMouseEnter = () => {
    // Prefetch pet details when hovering
    prefetchPet(pet.id);
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <h3>{pet.name}</h3>
      {/* Pet content */}
    </div>
  );
}
```

### 3. **Real-time Updates**

```tsx
import { useRealtimeChat } from './hooks/useChat-query';

function ChatComponent({ conversationId }) {
  useRealtimeChat(conversationId); // WebSocket integration

  const { data: messages } = useMessages(conversationId, {
    refetchInterval: false, // Disable polling, use WebSocket instead
  });

  return <MessageList messages={messages} />;
}
```

### 4. **Optimistic Updates**

```tsx
import { useOptimisticSendMessage } from './hooks/useChat-query';

function ChatInput({ conversationId }) {
  const sendMessage = useSendMessage();
  const optimisticSendMessage = useOptimisticSendMessage();

  const handleSend = (content) => {
    const rollback = optimisticSendMessage(conversationId, content);
    
    // Send actual message
    sendMessage.mutate(
      { conversationId, content },
      {
        onError: () => {
          rollback(); // Rollback on error
        },
      }
    );
  };

  return <input onSend={handleSend} />;
}
```

## 🔄 Migration Steps

### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Setup Provider
```tsx
// Wrap your app with QueryProvider
<QueryProvider>
  <App />
</QueryProvider>
```

### Step 3: Replace useEffect + fetch
```tsx
// Before
useEffect(() => {
  fetch('/api/v1/pets').then(setData);
}, []);

// After
const { data } = usePets();
```

### Step 4: Add Mutations
```tsx
// Before
const createPet = async (petData) => {
  const response = await fetch('/api/v1/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  });
  return response.json();
};

// After
const createPet = useCreatePet();
createPet.mutate(petData);
```

### Step 5: Add Error Handling
```tsx
// Before
try {
  const data = await fetch('/api/v1/pets');
  setData(data);
} catch (error) {
  setError(error.message);
}

// After (automatic)
const { data, error } = usePets({
  onError: (error) => toast.error(error.message),
});
```

## 🎯 Query Keys

Query keys are the foundation of TanStack Query caching:

```tsx
// Good query keys
export const queryKeys = {
  all: ['pets'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: string) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: queryKeys.detail(petId),
  queryFn: () => fetchPet(petId),
});
```

## 🔧 Custom Hooks

### Generic API Hook

```tsx
// src/app/hooks/use-api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useApiQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 3;
    },
    ...options,
  });
}

export function useApiMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: any
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Operation successful!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Operation failed');
    },
    ...options,
  });
}
```

### Usage

```tsx
// Use the generic hooks
const { data: pets } = useApiQuery(['pets'], fetchPets);
const createPet = useApiMutation(createPetFn);
```

## 📊 Performance Tips

### 1. **Proper Stale Time**
```tsx
// Static data (rarely changes)
useUserProfile({ staleTime: 30 * 60 * 1000 }); // 30 minutes

// Dynamic data (changes often)
useMessages({ staleTime: 30 * 1000 }); // 30 seconds

// Real-time data (changes constantly)
useUnreadCount({ staleTime: 5 * 1000 }); // 5 seconds
```

### 2. **Selective Refetching**
```tsx
// Only refetch when needed
const { data } = usePets({
  refetchOnWindowFocus: false, // Don't refetch on window focus
  refetchInterval: false, // Don't refetch on interval
});

// Manual refetch
const { refetch } = usePets();
<button onClick={() => refetch()}>Refresh</button>
```

### 3. **Background Updates**
```tsx
// Update cache without refetching
const queryClient = useQueryClient();

// Update specific item
queryClient.setQueryData(['pets', petId], (old) => ({ ...old, name: 'New Name' }));

// Update list
queryClient.setQueryData(['pets'], (old) => 
  old.map(pet => pet.id === petId ? { ...pet, name: 'New Name' } : pet)
);
```

## 🎉 Conclusion

TanStack Query provides:

✅ **Automatic caching** - No more manual cache management  
✅ **Background refetching** - Always up-to-date data  
✅ **Optimistic updates** - Instant UI updates  
✅ **Error handling** - Built-in error recovery  
✅ **Loading states** - Automatic loading indicators  
✅ **DevTools** - Debug cache and queries  
✅ **TypeScript support** - Full type safety  
✅ **Performance** - Efficient data fetching  

Your app will feel much faster and more responsive with TanStack Query! 🚀
