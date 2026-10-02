import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/Profile";

function AppRoutes() {
  const { isAuthenticated, profileComplete, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!profileComplete) {
    return <Profile onComplete={() => window.location.reload()} />;
  }

  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
