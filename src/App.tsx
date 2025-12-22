import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Pages
import RoleSelection from "./pages/RoleSelection";
import CustomerHome from "./pages/customer/CustomerHome";
import DesignersList from "./pages/customer/DesignersList";
import DesignerProfile from "./pages/customer/DesignerProfile";
import ServiceRequest from "./pages/customer/ServiceRequest";
import CustomerRequests from "./pages/customer/CustomerRequests";
import CustomerProfile from "./pages/customer/CustomerProfile";
import DesignerDashboard from "./pages/designer/DesignerDashboard";
import DesignerRequests from "./pages/designer/DesignerRequests";
import DesignerReviews from "./pages/designer/DesignerReviews";
import DesignerProfileEdit from "./pages/designer/DesignerProfileEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'customer' | 'designer' }) {
  const { role, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== allowedRole) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, role } = useAuthStore();
  
  if (isAuthenticated && role) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <RoleSelection />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<AuthRedirect />} />
          
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
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerProfile />
            </ProtectedRoute>
          } />
          
          {/* Designer Routes */}
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
