import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import App from "./App";
import BlogPage from "./components/blog/BlogPage";
import MarketplaceDashboard from "./pages/MarketplaceDashboard";
import Profile from "./pages/Profile";

export default function Router() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<App />} />
          <Route path="/dashboard"    element={<App />} />
          <Route path="/home"         element={<App />} />
          <Route path="/blog"         element={<BlogPage />} />
          <Route path="/marketplace"  element={<MarketplaceDashboard />} />
          <Route path="/blog/:slug"   element={<BlogPage />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
