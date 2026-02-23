import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('elms_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('elms_token');
            const savedUser = localStorage.getItem('elms_user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('elms_token', authToken);
        localStorage.setItem('elms_user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('elms_token');
        localStorage.removeItem('elms_user');
        delete api.defaults.headers.common['Authorization'];
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('elms_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
