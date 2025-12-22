import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Pages
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import CustomerHome from "./pages/customer/CustomerHome";
import DesignersList from "./pages/customer/DesignersList";
import DesignerProfile from "./pages/customer/DesignerProfile";
import ServiceRequest from "./pages/customer/ServiceRequest";
import CustomerRequests from "./pages/customer/CustomerRequests";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerMessages from "./pages/customer/CustomerMessages";
import CustomerChat from "./pages/customer/CustomerChat";
import DesignerDashboard from "./pages/designer/DesignerDashboard";
import DesignerRequests from "./pages/designer/DesignerRequests";
import DesignerReviews from "./pages/designer/DesignerReviews";
import DesignerProfileEdit from "./pages/designer/DesignerProfileEdit";
import DesignerOnboarding from "./pages/designer/DesignerOnboarding";
import DesignerMessages from "./pages/designer/DesignerMessages";
import DesignerChat from "./pages/designer/DesignerChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'customer' | 'designer' }) {
  const { role, isAuthenticated, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If user has no role yet, redirect to role selection
  if (!role) {
    return <Navigate to="/select-role" replace />;
  }
  
  if (role !== allowedRole) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, role, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    // If authenticated but no role, go to role selection
    if (!role) {
      return <Navigate to="/select-role" replace />;
    }
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <Auth />;
}

function RoleSelectionRoute() {
  const { isAuthenticated, role, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If already has a role, redirect to their dashboard
  if (role) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <RoleSelection />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/select-role" element={<RoleSelectionRoute />} />
      
      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerHome />
        </ProtectedRoute>
      } />
      <Route path="/customer/designers" element={
        <ProtectedRoute allowedRole="customer">
          <DesignersList />
        </ProtectedRoute>
      } />
      <Route path="/customer/designer/:id" element={
        <ProtectedRoute allowedRole="customer">
          <DesignerProfile />
        </ProtectedRoute>
      } />
      <Route path="/customer/request/:designerId" element={
        <ProtectedRoute allowedRole="customer">
          <ServiceRequest />
        </ProtectedRoute>
      } />
      <Route path="/customer/requests" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerRequests />
        </ProtectedRoute>
      } />
      <Route path="/customer/messages" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerMessages />
        </ProtectedRoute>
      } />
      <Route path="/customer/chat/:conversationId" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerChat />
        </ProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerProfile />
        </ProtectedRoute>
      } />
      
      {/* Designer Routes */}
      <Route path="/designer/onboarding" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerOnboarding />
        </ProtectedRoute>
      } />
      <Route path="/designer" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/designer/requests" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerRequests />
        </ProtectedRoute>
      } />
      <Route path="/designer/messages" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerMessages />
        </ProtectedRoute>
      } />
      <Route path="/designer/chat/:conversationId" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerChat />
        </ProtectedRoute>
      } />
      <Route path="/designer/reviews" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerReviews />
        </ProtectedRoute>
      } />
      <Route path="/designer/profile" element={
        <ProtectedRoute allowedRole="designer">
          <DesignerProfileEdit />
        </ProtectedRoute>
      } />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
