import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
}

export function useListItems(listId: string | null) {
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!listId) return;
        fetchItems();

        // Realtime subscription
        const subscription = supabase
            .channel(`list_items:${listId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
                (payload: RealtimePostgresChangesPayload<ListItem>) => {
                    handleRealtimeUpdate(payload);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [listId]);

    async function fetchItems() {
        if (!listId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('list_items')
            .select('*')
            .eq('list_id', listId)
            .neq('status', 'removed') // Don't show removed items by default
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching items:', error);
        } else {
            // cast status to strict type if needed, or rely on TS inference
            setItems(data as ListItem[] || []);
        }
        setLoading(false);
    }

    function handleRealtimeUpdate(payload: RealtimePostgresChangesPayload<ListItem>) {
        // Basic Optimistic Updates handling
        if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new as ListItem]);
        } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => item.id === payload.new.id ? (payload.new as ListItem) : item));
        } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
    }

    async function addItem(name: string, quantity?: number, unit?: string, category?: string) {
        if (!listId) return;
        const { error } = await supabase
            .from('list_items')
            .insert([{
                list_id: listId,
                name,
                quantity,
                unit,
                category,
                source: 'manual'
            }]);

        if (error) throw error;
        // Realtime will handle the state update
    }

    async function updateItem(id: string, updates: Partial<ListItem>) {
        const { error } = await supabase
            .from('list_items')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }

    async function toggleStatus(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'purchased' : 'active';
        await updateItem(id, { status: newStatus });
    }

    async function deleteItem(id: string) {
        // Soft delete by setting status to removed
        await updateItem(id, { status: 'removed' });
    }

    return { items, loading, addItem, updateItem, deleteItem, toggleStatus };
}
