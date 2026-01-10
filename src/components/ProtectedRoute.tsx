import { Navigate, Outlet } from 'react-router-dom';
import type { User } from 'firebase/auth';

interface ProtectedRouteProps {
    user: User | null | undefined;
}

export default function ProtectedRoute({ user }: ProtectedRouteProps) {
    if (user === undefined) {
        return <div className="flex justify-center p-10">Loading...</div>; // Simple loading state
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
