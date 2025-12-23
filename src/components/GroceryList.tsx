import { useState } from 'react';
import { useListItems } from '../hooks/useListItems';
import { Plus, Trash2, Check, AlertTriangle } from 'lucide-react';

interface GroceryListProps {
    listId: string;
}

export default function GroceryList({ listId }: GroceryListProps) {
    const { items, loading, addItem, toggleStatus, deleteItem } = useListItems(listId);
    const [newItemName, setNewItemName] = useState('');

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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleStatus(item.id, item.status)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 hover:border-blue-500"
                            >
                                {/* Empty circle for active */}
                            </button>
                            <div className="flex flex-col">
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
                            </div>
                        </div>
                        <button
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
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
