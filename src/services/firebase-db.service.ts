import { db } from '@/libs/firebase';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    query as firestoreQuery,
    getDoc,
    getDocs,
    limit as limitFn,
    onSnapshot,
    orderBy,
    Query,
    QueryDocumentSnapshot,
    runTransaction,
    startAfter as startAfterFn,
    Unsubscribe,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';

export interface QueryOptions {
    limit?: number;
    startAfter?: QueryDocumentSnapshot<DocumentData>;
    where?: Array<{ field: string; operator: any; value: any }>;
    orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
}

const buildQuery = (
    collectionRef: CollectionReference<DocumentData>,
    options?: QueryOptions,
): Query<DocumentData> => {
    let q: Query<DocumentData> = collectionRef;

    if (options?.where) {
        options.where.forEach((condition) => {
            q = firestoreQuery(q, where(condition.field, condition.operator, condition.value));
        });
    }

    if (options?.orderBy) {
        options.orderBy.forEach((order) => {
            q = firestoreQuery(q, orderBy(order.field, order.direction || 'asc'));
        });
    }

    if (options?.limit) {
        q = firestoreQuery(q, limitFn(options.limit));
    }

    if (options?.startAfter) {
        q = firestoreQuery(q, startAfterFn(options.startAfter));
    }

    return q;
};

export class FirebaseDBService {
    /**
     * Lấy một document theo ID
     */
    static async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }

            return null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    /**
     * Lấy tất cả documents từ một collection
     */
    static async getDocuments<T>(collectionName: string, options?: QueryOptions): Promise<T[]> {
        try {
            const collectionRef = collection(db, collectionName);
            const q = buildQuery(collectionRef, options);

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    }

    /**
     * Thêm một document mới
     */
    static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    }

    /**
     * Cập nhật một document
     */
    static async updateDocument<T>(
        collectionName: string,
        docId: string,
        data: Partial<T>,
    ): Promise<void> {
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    /**
     * Xóa một document
     */
    static async deleteDocument(collectionName: string, docId: string): Promise<void> {
        try {
            const docRef = doc(db, collectionName, docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    /**
     * Thực hiện batch operations
     */
    static async batchOperation(
        operations: Array<{
            type: 'add' | 'update' | 'delete';
            collection: string;
            docId?: string;
            data?: any;
        }>,
    ): Promise<void> {
        try {
            const batch = writeBatch(db);

            operations.forEach((operation) => {
                if (operation.type === 'add') {
                    const docRef = doc(collection(db, operation.collection));
                    batch.set(docRef, operation.data);
                } else if (operation.type === 'update' && operation.docId) {
                    const docRef = doc(db, operation.collection, operation.docId);
                    batch.update(docRef, operation.data);
                } else if (operation.type === 'delete' && operation.docId) {
                    const docRef = doc(db, operation.collection, operation.docId);
                    batch.delete(docRef);
                }
            });

            await batch.commit();
        } catch (error) {
            console.error('Error in batch operation:', error);
            throw error;
        }
    }

    /**
     * Thực hiện transaction
     */
    static async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
        try {
            return await runTransaction(db, updateFunction);
        } catch (error) {
            console.error('Error in transaction:', error);
            throw error;
        }
    }

    /**
     * Lắng nghe thay đổi real-time
     */
    static subscribeToCollection<T>(
        collectionName: string,
        callback: (data: T[]) => void,
        options?: QueryOptions,
    ): Unsubscribe {
        const collectionRef = collection(db, collectionName);
        const q = buildQuery(collectionRef, options);

        return onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];
            callback(data);
        });
    }

    /**
     * Lắng nghe thay đổi của một document cụ thể
     */
    static subscribeToDocument<T>(
        collectionName: string,
        docId: string,
        callback: (data: T | null) => void,
    ): Unsubscribe {
        const docRef = doc(db, collectionName, docId);

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as T;
                callback(data);
            } else {
                callback(null);
            }
        });
    }
}
