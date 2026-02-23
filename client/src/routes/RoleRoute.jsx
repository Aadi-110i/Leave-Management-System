import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'manager') return <Navigate to="/manager" replace />;
        return <Navigate to="/employee" replace />;
    }

    return children;
};

export default RoleRoute;
