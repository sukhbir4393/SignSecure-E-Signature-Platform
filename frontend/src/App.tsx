import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { DocumentProvider } from './contexts/DocumentContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import DocumentsList from './pages/documents/DocumentsList';
import DocumentUpload from './pages/documents/DocumentUpload';
import DocumentEditor from './pages/documents/DocumentEditor';
import DocumentView from './pages/documents/DocumentView';
import SignDocument from './pages/signing/SignDocument';
import SigningComplete from './pages/signing/SigningComplete';
import PublicRoute from './components/routing/PublicRoute';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <Router>
      <UserProvider>
        <DocumentProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/sign/:documentId/:token" element={<PublicRoute><SignDocument /></PublicRoute>} />
              <Route path="/signing-complete" element={<SigningComplete />} />
            </Route>

            {/* Protected routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/documents" element={<PrivateRoute><DocumentsList /></PrivateRoute>} />
              <Route path="/documents/upload" element={<PrivateRoute><DocumentUpload /></PrivateRoute>} />
              <Route path="/documents/edit/:id" element={<PrivateRoute><DocumentEditor /></PrivateRoute>} />
              <Route path="/documents/view/:id" element={<PrivateRoute><DocumentView /></PrivateRoute>} />
            </Route>
          </Routes>
        </DocumentProvider>
      </UserProvider>
    </Router>
  );
}

export default App;