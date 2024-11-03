import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Frontend from './Frontend';
import Auth from './Auth';
import PrivateRoutes from '../components/PrivateRoutes';
import Dashboard from './Dashboard';

export default function Index() {
    const { state } = useAuthContext();
    const isAdmin = state.user.role === 'admin';

    return (
        <Routes>
            <Route path='/*' element={isAdmin ? <Navigate to='/dashboard' /> : <Frontend />} />
            <Route path='auth/*' element={!state.isAuthenticated ? <Auth /> : <Navigate to='/' />} />
            <Route path='dashboard/*' element={<PrivateRoutes allowedRoles={['admin']} Component={Dashboard} />} />
        </Routes>
    );
}
