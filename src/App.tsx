
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { WhatsAppSettingsProvider } from "@/contexts/WhatsAppSettingsContext";
import TemplateProvider from "@/contexts/TemplateContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Couriers from "@/pages/Couriers";
import SenderAddresses from "@/pages/SenderAddresses";
import GenerateSlip from "@/pages/GenerateSlip";
import Reports from "@/pages/Reports";
import BoxWeights from "@/pages/BoxWeights";
import AuditLogs from "@/pages/AuditLogs";
import UserManagement from "@/pages/UserManagement";
import WhatsAppSettings from "@/pages/WhatsAppSettings";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import CustomerOnboarding from './pages/CustomerOnboarding';
import TemplateEditor from "@/pages/TemplateEditor";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Import the ensureDefaultCouriersExist function
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/senders"
        element={
          <ProtectedRoute>
            <SenderAddresses />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/couriers"
        element={
          <ProtectedRoute>
            <Couriers />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/slips"
        element={
          <ProtectedRoute>
            <GenerateSlip />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/weights"
        element={
          <ProtectedRoute>
            <BoxWeights />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/whatsapp-settings"
        element={
          <ProtectedRoute>
            <WhatsAppSettings />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <AuditLogs />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <CustomerOnboarding />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <TemplateEditor />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <WhatsAppSettingsProvider>
            <TemplateProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </TemplateProvider>
          </WhatsAppSettingsProvider>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
