// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

import { auth } from './services/firebase';
import Dashboard from './components/Dashboard/Dashboard'; // Importa el nuevo componente
import Login from './components/Auth/Login'; // Asegúrate que este archivo exista
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Y este también
import ReportsPage from './components/Reports/ReportsPage';

import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <p className="text-white">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;