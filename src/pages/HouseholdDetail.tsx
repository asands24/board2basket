import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckSquare, Camera, Menu, Loader2, ShoppingCart, Utensils } from 'lucide-react';
import GroceryList from '../components/GroceryList';
import { useListItems } from '../hooks/useListItems';

export default function HouseholdDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listId, setListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addItem } = useListItems(listId);

  useEffect(() => {
    async function fetchList() {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from('lists')
        .select('id')
        .eq('household_id', id)
        .neq('status', 'complete')
        .limit(1)
        .maybeSingle();

      if (data) {
        setListId(data.id);
      } else {
        const { data: newList } = await supabase
          .from('lists')
          .insert([{ household_id: id, title: 'Groceries' }])
          .select()
          .single();
        if (newList) setListId(newList.id);
      }
      setLoading(false);
    }
    fetchList();
  }, [id]);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !listId) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Info = reader.result as string;

        const filePath = `${id}/${Date.now()}_${file.name}`;
        await supabase.storage.from('uploads').upload(filePath, file);

        const response = await fetch('/.netlify/functions/extract-whiteboard', {
          method: 'POST',
          body: JSON.stringify({ image: base64Info }),
        });

        if (!response.ok) throw new Error('AI extraction failed');

        const { items, warnings } = await response.json();

        if (items && Array.isArray(items)) {
          for (const item of items) {
            await addItem(item.name, item.quantity, item.unit, item.category);
          }
        }

        if (warnings?.length) {
          alert(`Scanned with warnings:\n${warnings.join('\n')}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error(error);
      alert('Scanning failed: ' + error.message);
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Household</h1>
        <button><Menu className="w-6 h-6" /></button>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="rounded-lg bg-white p-6 shadow min-h-[50vh]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Grocery List</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScanClick}
                disabled={scanning || !listId}
                className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 disabled:opacity-50"
              >
                {scanning ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Camera className="mr-1.5 h-4 w-4" />}
                {scanning ? 'Scanning...' : 'Scan'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : listId ? (
            <GroceryList listId={listId} />
          ) : (
            <div>No list found.</div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center p-2 text-blue-600">
          <CheckSquare className="h-6 w-6" />
          <span className="text-xs">List</span>
        </button>
        <button
          className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600"
          onClick={() => listId && navigate(`/shopping/${listId}`)}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs">Shop</span>
        </button>
        <button
          className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600"
          onClick={() => listId && navigate(`/mealplan/${listId}`)}
        >
          <Utensils className="h-6 w-6" />
          <span className="text-xs">Meals</span>
        </button>
      </nav>
    </div>
  );
}
