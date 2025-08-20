# Firebase Integration Setup Guide

## Tổng quan

Dự án này đã được tích hợp Firebase với các tính năng sau:

- **Firebase Authentication**: Quản lý đăng nhập/đăng ký
- **Firestore Database**: Database NoSQL real-time
- **Firebase Storage**: Lưu trữ file và media
- **Firebase Analytics**: Theo dõi analytics (tùy chọn)

## Cấu hình Firebase

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật các service cần thiết:
    - Authentication
    - Firestore Database
    - Storage

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc và thêm các biến môi trường:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Cài đặt Dependencies

```bash
npm install firebase
```

## Cấu trúc Files

```
src/
├── libs/
│   └── firebase.ts              # Firebase configuration
├── services/
│   ├── firebase-db.service.ts   # Firestore database service
│   └── firebase-storage.service.ts # Storage service
├── hooks/
│   └── useFirebase.ts           # React hooks for Firebase
└── examples/
    └── firebase-usage-example.tsx # Usage examples
```

## Cách sử dụng

### 1. Firebase Database (Firestore)

#### Sử dụng Hook (Recommended)

```tsx
import { useFirebase } from '@/hooks/useFirebase';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

function UserList() {
    const {
        data: users,
        loading,
        error,
        addDocument,
        updateDocument,
        deleteDocument,
    } = useFirebase<User>({
        collectionName: 'users',
        autoSubscribe: true, // Real-time updates
        queryOptions: {
            orderBy: [{ field: 'createdAt', direction: 'desc' }],
        },
    });

    const handleAddUser = async () => {
        await addDocument({
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date(),
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {users.map((user) => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    );
}
```

#### Sử dụng Service trực tiếp

```tsx
import { FirebaseDBService } from '@/services/firebase-db.service';

// Lấy tất cả documents
const users = await FirebaseDBService.getDocuments<User>('users', {
    where: [{ field: 'active', operator: '==', value: true }],
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    limit: 10,
});

// Thêm document mới
const docId = await FirebaseDBService.addDocument<User>('users', {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
});

// Cập nhật document
await FirebaseDBService.updateDocument<User>('users', docId, {
    name: 'John Updated',
});

// Xóa document
await FirebaseDBService.deleteDocument('users', docId);
```

### 2. Firebase Storage

#### Sử dụng Hook

```tsx
import { useFirebaseStorage } from '@/hooks/useFirebase';

function FileUpload() {
    const { uploadFile, uploadMultipleFiles, uploadProgress, uploading } = useFirebaseStorage();

    const handleUpload = async (file: File) => {
        const path = `uploads/${Date.now()}_${file.name}`;
        const downloadURL = await uploadFile(file, path);
        console.log('File uploaded:', downloadURL);
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
            />
            {uploadProgress && <div>Progress: {uploadProgress.progress}%</div>}
        </div>
    );
}
```

#### Sử dụng Service trực tiếp

```tsx
import { FirebaseStorageService } from '@/services/firebase-storage.service';

// Upload file với progress
const downloadURL = await FirebaseStorageService.uploadFileWithProgress(
    file,
    'uploads/photo.jpg',
    (progress) => console.log('Progress:', progress.progress),
);

// Upload multiple files
const urls = await FirebaseStorageService.uploadMultipleFiles(files, 'uploads/batch');

// Xóa file
await FirebaseStorageService.deleteFile('uploads/photo.jpg');
```

### 3. Firebase Authentication

```tsx
import { useFirebaseAuth } from '@/hooks/useFirebase';

function AuthStatus() {
    const { user, loading, isAuthenticated } = useFirebaseAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {isAuthenticated ? <div>Welcome, {user?.email}!</div> : <div>Please sign in</div>}
        </div>
    );
}
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Photos belong to users
    match /photos/{photoId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

## Best Practices

### 1. Error Handling

```tsx
const { addDocument, error } = useFirebase<User>();

const handleSubmit = async () => {
    try {
        await addDocument(userData);
        // Success
    } catch (error) {
        console.error('Error adding user:', error);
        // Handle error
    }
};
```

### 2. Loading States

```tsx
const { loading, data } = useFirebase<User>();

if (loading) return <LoadingSpinner />;
if (!data.length) return <EmptyState />;

return <UserList users={data} />;
```

### 3. Real-time Updates

```tsx
// Auto-subscribe to collection changes
const { data } = useFirebase<User>({
    collectionName: 'users',
    autoSubscribe: true,
});

// Manual subscription
useEffect(() => {
    const unsubscribe = FirebaseDBService.subscribeToCollection('users', (users) =>
        setUsers(users),
    );

    return () => unsubscribe();
}, []);
```

### 4. Batch Operations

```tsx
// Multiple operations in one batch
await FirebaseDBService.batchOperation([
    { type: 'add', collection: 'users', data: user1 },
    { type: 'add', collection: 'users', data: user2 },
    { type: 'update', collection: 'users', docId: 'existing-id', data: updates },
]);
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Đảm bảo environment variables đã được cấu hình đúng
2. **Permission denied**: Kiểm tra security rules trong Firebase Console
3. **CORS errors**: Cấu hình CORS cho Storage bucket
4. **Real-time updates not working**: Kiểm tra internet connection và Firebase rules

### Debug Mode

```tsx
// Enable debug logging
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

if (process.env.NODE_ENV === 'development') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
}
```

## Performance Tips

1. **Use indexes**: Tạo composite indexes cho complex queries
2. **Limit data**: Sử dụng `limit()` và pagination
3. **Cache data**: Implement caching strategy
4. **Optimize queries**: Tránh nested queries khi có thể
5. **Use offline persistence**: Enable offline support cho mobile apps

## Testing

```tsx
// Mock Firebase for testing
jest.mock('@/libs/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
}));
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
