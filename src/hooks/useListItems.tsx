import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    where
} from 'firebase/firestore';

export interface ListItem {
    id: string;
    list_id: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string | null;
    status: 'active' | 'purchased' | 'removed';
    confidence: number | null;
    source: 'manual' | 'whiteboard' | 'receipt';
    claimed_by: string | null;
}

export function useListItems(listId: string | null) {
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!listId) return;

        setLoading(true);
        const q = query(
            collection(db, 'lists', listId, 'items'),
            where('status', '!=', 'removed'),
            orderBy('status'), // Firestore requires orderBy field to be in filter if inequality is used? No, strictly inequality on one field implies orderBy on that field first.
            // Actually simpler: Query all, filter in memory if 'removed' is minimal, or use index.
            // For now, let's assuming 'status' != 'removed' works if we have an index or just do:
            // orderBy('created_at') and filter in map?
            // Firestore doesn't support != easily with other sort unless index exists.
            // Let's filter on client side for MVP or just assume 'status' index exists.
            // Simplified query:
            orderBy('created_at', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedItems: ListItem[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Client-side filtering for removed items if needed
                if (data.status === 'removed') return;

                loadedItems.push({
                    id: doc.id,
                    list_id: listId,
                    name: data.name,
                    quantity: data.quantity,
                    unit: data.unit,
                    category: data.category,
                    status: data.status,
                    confidence: data.confidence,
                    source: data.source,
                    claimed_by: data.claimed_by
                });
            });
            setItems(loadedItems);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching items:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [listId]);

    async function addItem(name: string, quantity?: number, unit?: string, category?: string) {
        if (!listId) return;

        await addDoc(collection(db, 'lists', listId, 'items'), {
            list_id: listId, // redundantly stored for easier reference if needed
            name,
            quantity: quantity || null,
            unit: unit || null,
            category: category || null,
            status: 'active',
            source: 'manual',
            created_at: Timestamp.now()
        });
    }

    async function updateItem(id: string, updates: Partial<ListItem>) {
        if (!listId) return;
        const itemRef = doc(db, 'lists', listId, 'items', id);
        await updateDoc(itemRef, updates);
    }

    async function toggleStatus(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'purchased' : 'active';
        await updateItem(id, { status: newStatus as any });
    }

    async function deleteItem(id: string) {
        // Soft delete by setting status to removed
        await updateItem(id, { status: 'removed' });
    }

    async function claimItem(id: string) {
        const user = auth.currentUser;
        if (!user) return;
        await updateItem(id, { claimed_by: user.uid });
    }

    async function unclaimItem(id: string) {
        await updateItem(id, { claimed_by: null });
    }

    return { items, loading, addItem, updateItem, deleteItem, toggleStatus, claimItem, unclaimItem };
}
