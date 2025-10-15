import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import ConfirmEmail from "./pages/ConfirmEmail";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import NavbarSlider from "./components/NavbarSlider";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import WalletPage from "./pages/WalletPage";
import MyThemes from "./pages/MyThemes";

function AppWrapper() {
  const location = useLocation();
  const hideNavbarRoutes = ["/admin/dashboard", "/admin/login"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <NavbarSlider />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/profile/:username" element={<PublicProfile />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/themes" element={<MyThemes />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
