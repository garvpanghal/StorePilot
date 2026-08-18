import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Shell from './layouts/Shell';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('storepilot-theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('storepilot-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <ToastProvider>
        <Shell theme={theme} onTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login initialMode="signup" />} />
          
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          
          <Route path="/sales" element={
            <ProtectedRoute>
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/purchases" element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliers" element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Shell>
     </ToastProvider>
    </AuthProvider>
  );
}
