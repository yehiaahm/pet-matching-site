# Socket.io Events

- Client connects to backend root and emits `registerUser` with their `userId` to join a private room.
- Server can emit `instantAlert` to a user room with payload:

```
{
  id: string,
  title: string,
  message: string,
  data: any,
  createdAt: ISOString
}
```

## Frontend Usage

```
import { initSocket, onInstantAlert } from './src/lib/socket';
const socket = initSocket('http://localhost:5000/api/v1', currentUserId);
onInstantAlert((payload) => console.log('Alert', payload));
```
