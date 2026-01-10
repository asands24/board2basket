import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import HouseholdDetail from './pages/HouseholdDetail';
import ShoppingMode from './pages/ShoppingMode';
import MealPlan from './pages/MealPlan';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user profile
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            display_name: user.displayName || user.email?.split('@')[0],
            last_seen: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.error("Error updating user profile", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null; // Avoid flicker

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

        <Route element={<ProtectedRoute user={user} />}>
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
