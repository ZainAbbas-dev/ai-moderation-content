import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SubmissionView from './pages/SubmissionView';
import AdminDashboard from './pages/AdminDashboard';
import PolicyConfig from './pages/PolicyConfig';
import Login from './pages/Login';

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const role = localStorage.getItem('role'); // 'user' or 'admin'

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
        <nav className="bg-white shadow-sm border-b border-gray-200 p-4 mb-8 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <span className="bg-blue-600 text-white p-1 rounded-md text-sm">AI</span> Moderation
            </h1>
            {isAuthenticated && (
                <button 
                    onClick={() => { localStorage.clear(); window.location.reload(); }} 
                    className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
                >
                    Sign Out
                </button>
            )}
        </nav>
        
        <main className="container mx-auto px-4">
            <Routes>
                {/* Root Route: Redirects based on authentication and role */}
                <Route 
                    path="/" 
                    element={!isAuthenticated ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/submissions'} />} 
                />
                
                {/* User Routes */}
                <Route 
                    path="/submissions" 
                    element={isAuthenticated && role === 'user' ? <SubmissionView /> : <Navigate to="/" />} 
                />
                
                {/* Admin Routes */}
                <Route 
                    path="/admin" 
                    element={isAuthenticated && role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/admin/policies" 
                    element={isAuthenticated && role === 'admin' ? <PolicyConfig /> : <Navigate to="/" />} 
                />
            </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;