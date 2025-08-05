import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/auth/AuthForm';
import { Layout } from './components/layout/Layout';
import { LocationsPage } from './pages/locations/LocationsPage';
import { auth } from './lib/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChange((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
    
    return unsubscribe;
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <div className="flex items-center justify-center min-h-screen">
                  <AuthForm />
                </div>
              ) : (
                <Navigate to="/locations" replace />
              )
            }
          />
          <Route
            element={isAuthenticated ? <Layout /> : <Navigate to="/" replace />}
          >
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/antennas" element={<div>Antennas</div>} />
            <Route path="/sensors" element={<div>Sensors</div>} />
            <Route path="/readings" element={<div>Readings</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;