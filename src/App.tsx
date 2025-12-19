import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import HouseholdDetail from './pages/HouseholdDetail';
import ShoppingMode from './pages/ShoppingMode';
import MealPlan from './pages/MealPlan';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useHouseholds } from './hooks/useHouseholds';

const DashboardStub = () => {
  const { households, loading } = useHouseholds();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (households.length === 0) {
        navigate('/onboarding');
      } else if (households.length > 0) {
        // For MVP, just go to the first household
        navigate(`/household/${households[0].id}`);
      }
    }
  }, [households, loading, navigate]);

  return <div className="flex h-screen items-center justify-center">Loading your household...</div>;
};


function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // Avoid flicker

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardStub />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/household/:id" element={<HouseholdDetail />} />
          <Route path="/shopping/:listId" element={<ShoppingMode />} />
          <Route path="/mealplan/:listId" element={<MealPlan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
