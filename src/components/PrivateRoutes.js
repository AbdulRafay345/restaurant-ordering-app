import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Login from '../pages/Auth/Login';
import { Navigate } from 'react-router-dom';

export default function PrivateRoutes({ Component, allowedRoles }) {
    const { state } = useAuthContext();

    if (!state.isAuthenticated) return <Login />

    if (allowedRoles && !allowedRoles.includes(state.user.role)) {
        return <Navigate to='/' />;
    }

    return <Component />;
}
