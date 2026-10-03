import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;



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
