import { useState, useEffect, useCallback } from 'react';
import { FirebaseDBService, QueryOptions } from '@/services/firebase-db.service';
import { FirebaseStorageService, UploadProgress } from '@/services/firebase-storage.service';
import { auth } from '@/libs/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { KEY_LOCAL_STORAGE } from '@/constants';
import { isEmpty } from 'lodash';

export interface UseFirebaseOptions {
    collectionName?: string;
    autoSubscribe?: boolean;
    queryOptions?: QueryOptions;
}

export function useFirebase<T = any>(options: UseFirebaseOptions = {}) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    // Auto-subscribe to collection changes
    useEffect(() => {
        if (options.autoSubscribe && options.collectionName) {
            const unsubscribe = FirebaseDBService.subscribeToCollection<T>(
                options.collectionName,
                (newData) => setData(newData),
                options.queryOptions,
            );

            return () => unsubscribe();
        }
    }, [options.collectionName, options.autoSubscribe, options.queryOptions]);

    // CRUD operations
    const getDocuments = useCallback(
        async (collectionName?: string, queryOptions?: QueryOptions) => {
            setLoading(true);
            setError(null);
            try {
                const collection = collectionName || options.collectionName;
                if (!collection) throw new Error('Collection name is required');

                const result = await FirebaseDBService.getDocuments<T>(collection, queryOptions);
                setData(result);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [options.collectionName],
    );

    const getDocument = useCallback(
        async (docId: string, collectionName?: string) => {
            setLoading(true);
            setError(null);
            try {
                const collection = collectionName || options.collectionName;
                if (!collection) throw new Error('Collection name is required');

                const result = await FirebaseDBService.getDocument<T>(collection, docId);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [options.collectionName],
    );

    const addDocument = useCallback(
        async (data: Omit<T, 'id'>, collectionName?: string) => {
            setLoading(true);
            setError(null);
            try {
                const collection = collectionName || options.collectionName;
                if (!collection) throw new Error('Collection name is required');

                const docId = await FirebaseDBService.addDocument<T>(collection, data);
                return docId;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [options.collectionName],
    );

    const updateDocument = useCallback(
        async (docId: string, data: Partial<T>, collectionName?: string) => {
            setLoading(true);
            setError(null);
            try {
                const collection = collectionName || options.collectionName;
                if (!collection) throw new Error('Collection name is required');

                await FirebaseDBService.updateDocument<T>(collection, docId, data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [options.collectionName],
    );

    const deleteDocument = useCallback(
        async (docId: string, collectionName?: string) => {
            setLoading(true);
            setError(null);
            try {
                const collection = collectionName || options.collectionName;
                if (!collection) throw new Error('Collection name is required');

                await FirebaseDBService.deleteDocument(collection, docId);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [options.collectionName],
    );

    return {
        data,
        loading,
        error,
        user,
        getDocuments,
        getDocument,
        addDocument,
        updateDocument,
        deleteDocument,
        clearError: () => setError(null),
    };
}

export function useFirebaseStorage() {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

    const uploadFile = useCallback(
        async (file: File, path: string, metadata?: Record<string, string>) => {
            setUploading(true);
            setUploadProgress(null);
            try {
                const downloadURL = await FirebaseStorageService.uploadFileWithProgress(
                    file,
                    path,
                    (progress) => setUploadProgress(progress),
                    metadata,
                );
                return downloadURL;
            } catch (error) {
                throw error;
            } finally {
                setUploading(false);
            }
        },
        [],
    );

    const uploadMultipleFiles = useCallback(async (files: File[], basePath: string) => {
        setUploading(true);
        try {
            const downloadURLs = await FirebaseStorageService.uploadMultipleFiles(
                files,
                basePath,
                (fileIndex, progress) => {
                    // Fix: Only set known properties from UploadProgress, and expose fileIndex separately
                    setUploadProgress({
                        ...progress,
                        // fileIndex is not part of UploadProgress, so we ignore it here
                    });
                    // Optionally, you could manage fileIndex in a separate state if needed
                },
            );
            return downloadURLs;
        } catch (error) {
            throw error;
        } finally {
            setUploading(false);
        }
    }, []);

    const deleteFile = useCallback(async (path: string) => {
        try {
            await FirebaseStorageService.deleteFile(path);
        } catch (error) {
            throw error;
        }
    }, []);

    const getDownloadURL = useCallback(async (path: string) => {
        try {
            return await FirebaseStorageService.getDownloadURL(path);
        } catch (error) {
            throw error;
        }
    }, []);

    return {
        uploadFile,
        uploadMultipleFiles,
        deleteFile,
        getDownloadURL,
        uploadProgress,
        uploading,
        clearProgress: () => setUploadProgress(null),
    };
}

export function useFirebaseAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseLoading, setFirebaseLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>(KEY_LOCAL_STORAGE.FIREBASE_TOKEN);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setFirebaseLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        setFirebaseLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (userCredential?.user) {
                const tokenFirebase = await userCredential.user.getIdToken();
                setToken(tokenFirebase);

                window.location.href = '/dashboard';

                return true;
            }

            return false;
        } catch (error) {
            return false;
        } finally {
            setFirebaseLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();

        setUser(null);
        setToken(undefined);

        window.location.href = '/login';
    };

    return {
        user,
        token,
        firebaseLoading,
        isAuthenticated: !isEmpty(user) && token,
        handleLogin,
        handleLogout,
    };
}
