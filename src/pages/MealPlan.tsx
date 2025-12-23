import { useParams, useNavigate } from 'react-router-dom';
import { useListItems } from '../hooks/useListItems';
import { useState } from 'react';
import { ArrowLeft, ChefHat, Loader2, Utensils } from 'lucide-react';

interface MealPlanData {
    days: {
        day: number;
        meals: {
            title: string;
            time_minutes: number;
            ingredients_used: { name: string; amount: string | null }[];
            optional_staples: string[];
            steps: string[];
        }[];
    }[];
    shopping_additions: string[];
}

export default function MealPlan() {
    const { listId } = useParams<{ listId: string }>();
    const navigate = useNavigate();
    const { items, loading: itemsLoading } = useListItems(listId || null);
    const [generating, setGenerating] = useState(false);
    const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);

    if (!listId) return <div>Invalid List ID</div>;

    const purchasedItems = items.filter(i => i.status === 'purchased');
    const activeItems = items.filter(i => i.status === 'active');

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // 1. Gather ingredients (Purchased + Active as backup? Prompt said purchased but usually you cook with what you have)
            // I'll send purchased items primarily.
            const ingredients = purchasedItems.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }));

            if (ingredients.length === 0) {
                if (!confirm("No purchased items found. Use active items instead?")) {
                    setGenerating(false);
                    return;
                }
                activeItems.forEach(i => ingredients.push({ name: i.name, quantity: i.quantity, unit: i.unit }));
            }

            // 2. Call API
            const response = await fetch('/.netlify/functions/generate-mealplan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: ingredients,
                    preferences: { diet: "any" } // Placeholder for preferences
                }),
            });

            if (!response.ok) throw new Error('Failed to generate plan');

            const data = await response.json();
            setMealPlan(data);

            // Save to DB (optional for MVP, skipping for speed unless asked)

        } catch (error: any) {
            console.error(error);
            alert('Generation failed: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-10 bg-emerald-600 px-4 py-4 text-white shadow-md flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-emerald-700 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ChefHat className="h-6 w-6" />
                    Meal Plan
                </h1>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
                {!mealPlan && (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center mt-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Weekly Plan</h2>
                        <p className="text-gray-500 mb-8">
                            Generate recipes using your {purchasedItems.length} purchased ingredients.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || itemsLoading}
                            className="w-full rounded-md bg-emerald-600 px-4 py-3 text-white font-semibold shadow-md hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {generating ? <Loader2 className="animate-spin h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
                            {generating ? 'Generating Chef Magic...' : 'Generate Meal Plan'}
                        </button>
                    </div>
                )}

                {mealPlan && (
                    <div className="space-y-6">
                        {mealPlan.days.map((day) => (
                            <div key={day.day} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 font-semibold text-emerald-800">
                                    Day {day.day}
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {day.meals.map((meal, idx) => (
                                        <div key={idx} className="p-4">
                                            <h3 className="text-lg font-bold text-gray-900">{meal.title}</h3>
                                            <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                                ⏱ {meal.time_minutes} mins
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Ingredients</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {meal.ingredients_used.map((ing, i) => (
                                                        <span key={i} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                            {ing.name}
                                                        </span>
                                                    ))}
                                                    {meal.optional_staples.map((staple, i) => (
                                                        <span key={i} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                            {staple} (staple)
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Instructions</h4>
                                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                                                    {meal.steps.map((step, sIdx) => (
                                                        <li key={sIdx}>{step}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {mealPlan.shopping_additions.length > 0 && (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-amber-900">
                                <h3 className="font-bold mb-2">Missing Ingredients</h3>
                                <ul className="list-disc list-inside text-sm">
                                    {mealPlan.shopping_additions.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setMealPlan(null)}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-900 py-4"
                        >
                            Start Over
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
