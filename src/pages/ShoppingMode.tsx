import { useParams, useNavigate } from 'react-router-dom';
import { useListItems } from '../hooks/useListItems';
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';

export default function ShoppingMode() {
    const { listId } = useParams<{ listId: string }>();
    const navigate = useNavigate();
    // Safe cast since we check listId
    const { items, toggleStatus } = useListItems(listId || null);

    if (!listId) return <div>Invalid List ID</div>;

    const activeItems = items.filter(i => i.status === 'active');
    const purchasedItems = items.filter(i => i.status === 'purchased');
    const sortedItems = [...activeItems].sort((a, b) => (a.category || '').localeCompare(b.category || ''));

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="sticky top-0 z-10 bg-blue-600 px-4 py-4 text-white shadow-md flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-blue-700 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Mode
                </h1>
                <div className="ml-auto text-sm font-medium bg-blue-700 px-3 py-1 rounded-full">
                    {activeItems.length} left
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4">
                {activeItems.length === 0 && purchasedItems.length > 0 && (
                    <div className="py-20 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">All Done! 🎉</h2>
                        <p className="text-gray-500 mt-2">You've grabbed everything on the list.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg"
                        >
                            Back to List
                        </button>
                    </div>
                )}

                {sortedItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => toggleStatus(item.id, item.status)}
                        className="flex items-center gap-4 rounded-xl border-2 border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer bg-white"
                    >
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-gray-300">
                            {/* Unchecked */}
                        </div>
                        <div className="flex-1">
                            <div className="text-lg font-medium text-gray-900">{item.name}</div>
                            {(item.quantity || item.category) && (
                                <div className="text-sm text-gray-500">
                                    {item.quantity && <span>{item.quantity} {item.unit} • </span>}
                                    {item.category || 'Uncategorized'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {purchasedItems.length > 0 && (
                    <div className="mt-8 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 px-2">Purchased</h3>
                        <div className="space-y-2 opacity-60 grayscale">
                            {purchasedItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleStatus(item.id, item.status)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="line-through text-gray-500">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
