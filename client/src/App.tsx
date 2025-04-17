import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Dashboard Components
import AdminDashboard from './pages/admin/Dashboard';
import ProjectsList from './pages/admin/ProjectsList';
import ProjectCreate from './pages/admin/ProjectCreate';
import ProjectDetail from './pages/admin/ProjectDetail';
import InterviewsList from './pages/admin/InterviewsList';
import InterviewCreate from './pages/admin/InterviewCreate';
import InterviewDetail from './pages/admin/InterviewDetail';
import ResponsesList from './pages/admin/ResponsesList';
import ResponseDetail from './pages/admin/ResponseDetail';
import AnalysisList from './pages/admin/AnalysisList';
import AnalysisDetail from './pages/admin/AnalysisDetail';
import AnalysisCreate from './pages/admin/AnalysisCreate';

// Client Portal Components
import ClientDashboard from './pages/client/Dashboard';
import ClientProjectsList from './pages/client/ProjectsList';
import ClientProjectDetail from './pages/client/ProjectDetail';
import ClientInterviewDetail from './pages/client/InterviewDetail';
import ClientAnalysisDetail from './pages/client/AnalysisDetail';

// Respondent Interface Components
import InterviewLanding from './pages/respondent/InterviewLanding';
import InterviewSession from './pages/respondent/InterviewSession';
import InterviewComplete from './pages/respondent/InterviewComplete';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import ClientLayout from './components/layouts/ClientLayout';
import PublicLayout from './components/layouts/PublicLayout';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a', // Purple
    },
    secondary: {
      main: '#00897b', // Jade green
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            
            {/* Respondent Interface Routes */}
            <Route path="/interview/:accessCode" element={<PublicLayout><InterviewLanding /></PublicLayout>} />
            <Route path="/interview/:accessCode/session" element={<PublicLayout><InterviewSession /></PublicLayout>} />
            <Route path="/interview/:accessCode/complete" element={<PublicLayout><InterviewComplete /></PublicLayout>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><ProjectsList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projects/create" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><ProjectCreate /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projects/:id" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><ProjectDetail /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/interviews" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><InterviewsList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/interviews/create" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><InterviewCreate /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/interviews/:id" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><InterviewDetail /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/responses" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><ResponsesList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/responses/:id" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><ResponseDetail /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analyses" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AnalysisList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analyses/create" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AnalysisCreate /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analyses/:id" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AnalysisDetail /></AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Client Routes */}
            <Route path="/client" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout><ClientDashboard /></ClientLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/projects" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout><ClientProjectsList /></ClientLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/projects/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout><ClientProjectDetail /></ClientLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/interviews/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout><ClientInterviewDetail /></ClientLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/analyses/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout><ClientAnalysisDetail /></ClientLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
