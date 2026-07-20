import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SharedDashboard from './pages/SharedDashboard';
import DocumentPage from './pages/DocumentPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        
        {/* Authenticated Routes wrapped in Layout */}
        <Route 
          path="/" 
          element={
            <>
              <SignedIn>
                <Layout />
              </SignedIn>
              <SignedOut>
                <Navigate to="/auth" replace />
              </SignedOut>
            </>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="shared" element={<SharedDashboard />} />
          <Route path="documents/:id" element={<DocumentPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
