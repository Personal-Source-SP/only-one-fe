import React, { useState } from 'react';
import { useFirebase, useFirebaseStorage, useFirebaseAuth } from '@/hooks/useFirebase';

// Interface cho User
interface User {
    id: string;
    name: string;
    email: string;
    createdAt: any; // Accepts Firestore Timestamp or Date
    updatedAt: any;
}

// Interface cho Photo
interface Photo {
    id: string;
    userId: string;
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    tags: string[];
    createdAt: any;
    updatedAt: any;
}

// Helper to display date from Firestore Timestamp or JS Date
function formatDate(date: any): string {
    if (!date) return '';
    // Firestore Timestamp has toDate(), JS Date does not
    if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
        return date.toLocaleDateString();
    }
    // Try to parse if it's a string
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
    }
    return '';
}

// Component ví dụ sử dụng Firebase Database
export function FirebaseDBExample() {
    const [newUser, setNewUser] = useState({ name: '', email: '' });

    // Sử dụng hook với auto-subscribe
    const {
        data: users,
        loading,
        error,
        addDocument,
        updateDocument,
        deleteDocument,
    } = useFirebase<User>({
        collectionName: 'users',
        autoSubscribe: true,
        queryOptions: {
            orderBy: [{ field: 'createdAt', direction: 'desc' }],
        },
    });

    const handleAddUser = async () => {
        try {
            await addDocument({
                ...newUser,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            setNewUser({ name: '', email: '' });
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await updateDocument(userId, {
                ...updates,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDocument(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Firebase Database Example</h2>

            {/* Add User Form */}
            <div className="mb-6 p-4 border rounded">
                <h3 className="text-lg font-semibold mb-2">Add New User</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 border rounded"
                    />
                    <button
                        onClick={handleAddUser}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add User
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Users ({users.length})</h3>
                <div className="space-y-2">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="p-3 border rounded flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500">
                                    Created: {formatDate(user.createdAt)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        handleUpdateUser(user.id, {
                                            name: user.name + ' (Updated)',
                                        })
                                    }
                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Component ví dụ sử dụng Firebase Storage
export function FirebaseStorageExample() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const { uploadFile, uploadMultipleFiles, uploadProgress, uploading, deleteFile } =
        useFirebaseStorage();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
    };

    const handleSingleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const file = selectedFiles[0];
            const path = `uploads/${Date.now()}_${file.name}`;
            const downloadURL = await uploadFile(file, path);
            setUploadedFiles((prev) => [...prev, downloadURL]);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleMultipleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const basePath = `uploads/${Date.now()}`;
            const downloadURLs = await uploadMultipleFiles(selectedFiles, basePath);
            setUploadedFiles((prev) => [...prev, ...downloadURLs]);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    const handleDeleteFile = async (url: string) => {
        try {
            // Extract path from URL (you might need to adjust this based on your storage structure)
            const path = url.split('/o/')[1]?.split('?')[0];
            if (path) {
                await deleteFile(decodeURIComponent(path));
                setUploadedFiles((prev) => prev.filter((file) => file !== url));
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Firebase Storage Example</h2>

            {/* File Upload */}
            <div className="mb-6 p-4 border rounded">
                <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                <input type="file" multiple onChange={handleFileSelect} className="mb-4" />

                {selectedFiles.length > 0 && (
                    <div className="mb-4">
                        <p>Selected files: {selectedFiles.length}</p>
                        <ul className="text-sm text-gray-600">
                            {selectedFiles.map((file, index) => (
                                <li key={index}>
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleSingleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        Upload Single File
                    </button>
                    <button
                        onClick={handleMultipleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        Upload Multiple Files
                    </button>
                </div>

                {/* Upload Progress */}
                {uploadProgress && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1">
                            {uploadProgress.state === 'running' &&
                                `Uploading... ${uploadProgress.progress.toFixed(1)}%`}
                            {uploadProgress.state === 'success' && 'Upload completed!'}
                            {uploadProgress.state === 'error' && `Error: ${uploadProgress.error}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
                    <div className="space-y-2">
                        {uploadedFiles.map((url, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded flex justify-between items-center"
                            >
                                <div className="flex-1">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline break-all"
                                    >
                                        {url}
                                    </a>
                                </div>
                                <button
                                    onClick={() => handleDeleteFile(url)}
                                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Component ví dụ sử dụng Firebase Auth
export function FirebaseAuthExample() {
    const { user, loading, isAuthenticated } = useFirebaseAuth();

    if (loading) return <div>Loading auth state...</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Firebase Auth Example</h2>

            {isAuthenticated ? (
                <div className="p-4 border rounded bg-green-50">
                    <h3 className="text-lg font-semibold mb-2">Authenticated User</h3>
                    <p>
                        <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                        <strong>UID:</strong> {user?.uid}
                    </p>
                    <p>
                        <strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}
                    </p>
                    <p>
                        <strong>Last Sign In:</strong> {user?.metadata.lastSignInTime}
                    </p>
                </div>
            ) : (
                <div className="p-4 border rounded bg-yellow-50">
                    <h3 className="text-lg font-semibold mb-2">Not Authenticated</h3>
                    <p>Please sign in to access the application.</p>
                </div>
            )}
        </div>
    );
}

// Main component kết hợp tất cả examples
export default function FirebaseExamples() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Firebase Integration Examples</h1>

            <div className="space-y-8">
                <FirebaseAuthExample />
                <FirebaseDBExample />
                <FirebaseStorageExample />
            </div>
        </div>
    );
}
