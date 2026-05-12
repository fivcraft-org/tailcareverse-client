import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingsProvider } from "./context/SettingsContext";

import Home from "./pages/Home";
import Notifications from "./pages/Notifications";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/Profile";
import PetDetails from "./pages/PetDetails";
import Marketplace from "./pages/Marketplace";
import ServiceDirectory from "./pages/ServiceDirectory";
import CreatePost from "./pages/CreatePost";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Chat from "./pages/Chat";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import AIAssistant from "./pages/AIAssistant";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";

import Landing from "./pages/Landing";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import PublicRoute from "./routes/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import InitialLoader from "./components/common/InitialLoader";

const AppContent = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <InitialLoader />;
  }

  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ── Admin routes (no AppLayout — full custom shell) ── */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* ── Regular user routes (with AppLayout) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Chat />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/item/:id" element={<ListingDetail />} />
          <Route path="/marketplace/create" element={<CreateListing />} />
          <Route path="/marketplace/my-listings" element={<MyListings />} />
          <Route path="/marketplace/edit/:id" element={<EditListing />} />
          <Route path="/services" element={<ServiceDirectory />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <SocketProvider>
            <ThemeProvider>
              <SettingsProvider>
                <AppContent />
              </SettingsProvider>
            </ThemeProvider>
          </SocketProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
