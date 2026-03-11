import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Loading component with spinner
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
  </div>
);

// Protected route for Chinese users only
export const ChineseRoute = ({ children }) => {
  const { currentUser, userData, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but has no userData (no Firestore document)
  // Redirect to login - this shouldn't happen normally
  if (!userData) {
    console.warn("User authenticated but no userData found");
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "chinese") {
    return <Navigate to="/translator/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

// Protected route for Translator users only
export const TranslatorRoute = ({ children }) => {
  const { currentUser, userData, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but has no userData (no Firestore document)
  if (!userData) {
    console.warn("User authenticated but no userData found");
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "translator") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

// Route that redirects logged-in users to their dashboard
export const PublicRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser && userRole) {
    if (userRole === "translator") {
      return <Navigate to="/translator/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
