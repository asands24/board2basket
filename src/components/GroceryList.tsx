import { useState, useEffect } from 'react';
import { useListItems } from '../hooks/useListItems';
import { Plus, Trash2, Check, AlertTriangle, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GroceryListProps {
    listId: string;
}

export default function GroceryList({ listId }: GroceryListProps) {
    const { items, loading, addItem, toggleStatus, deleteItem, claimItem, unclaimItem } = useListItems(listId);
    const [newItemName, setNewItemName] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    useEffect(() => {
        // Fetch display names for all claimed_by users
        const claimedByIds = items
            .filter(i => i.claimed_by)
            .map(i => i.claimed_by as string)
            .filter((id, index, self) => self.indexOf(id) === index); // unique

        if (claimedByIds.length > 0) {
            supabase
                .from('profiles')
                .select('id, display_name')
                .in('id', claimedByIds)
                .then(({ data }) => {
                    if (data) {
                        const profiles: Record<string, string> = {};
                        data.forEach(p => {
                            profiles[p.id] = p.display_name || 'Someone';
                        });
                        setUserProfiles(profiles);
                    }
                });
        }
    }, [items]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        try {
            await addItem(newItemName);
            setNewItemName('');
        } catch (error) {
            console.error(error);
            alert('Failed to add item');
        }
    };

    const handleClaim = async (item: any) => {
        if (item.claimed_by === currentUserId) {
            await unclaimItem(item.id);
        } else if (!item.claimed_by) {
            await claimItem(item.id);
        }
    };

    if (loading && items.length === 0) {
        return <div className="p-4 text-center">Loading list...</div>;
    }

    const activeItems = items.filter(i => i.status === 'active');
    const purchasedItems = items.filter(i => i.status === 'purchased');

    return (
        <div className="space-y-6">
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add item (e.g. Milk)"
                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-4"
                />
                <button
                    type="submit"
                    className="rounded-md bg-blue-600 p-2.5 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </form>

            <div className="space-y-2">
                {activeItems.map((item) => (
                    <div
                        key={item.id}
                        className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                onClick={() => toggleStatus(item.id, item.status)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 hover:border-blue-500"
                            >
                                {/* Empty circle for active */}
                            </button>
                            <div className="flex flex-col flex-1">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    {item.quantity && <span>{item.quantity} {item.unit}</span>}
                                    {item.category && <span className="rounded-full bg-gray-100 px-2 py-0.5">{item.category}</span>}
                                </div>
                                {item.confidence !== null && item.confidence < 0.8 && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>Low confidence</span>
                                    </div>
                                )}
                                {item.claimed_by && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                                        <UserCheck className="h-3 w-3" />
                                        <span>
                                            {item.claimed_by === currentUserId
                                                ? 'Claimed by you'
                                                : `Claimed by ${userProfiles[item.claimed_by] || 'someone'}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!item.claimed_by || item.claimed_by === currentUserId ? (
                                <button
                                    onClick={() => handleClaim(item)}
                                    className={`text-xs px-2 py-1 rounded-md transition-opacity ${item.claimed_by === currentUserId
                                            ? 'bg-emerald-100 text-emerald-700 opacity-100'
                                            : 'bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100'
                                        }`}
                                >
                                    {item.claimed_by === currentUserId ? 'Unclaim' : 'Claim'}
                                </button>
                            ) : null}
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {activeItems.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                        List is empty. Add something!
                    </div>
                )}
            </div>

            {purchasedItems.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Purchased</h3>
                    <div className="space-y-2 opacity-60">
                        {purchasedItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <button
                                    onClick={() => toggleStatus(item.id, item.status)}
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <span className="line-through text-gray-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
