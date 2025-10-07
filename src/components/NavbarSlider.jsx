import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  FaUserEdit,
  FaSignOutAlt,
  FaUser,
  FaKey,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function NavbarSlider() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 Fetch user and username (used both on load and when auth state changes)
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("users")
          .select("username")
          .eq("id", currentUser.id)
          .maybeSingle();

        setUsername(
          profileData?.username ||
            currentUser.user_metadata?.username ||
            ""
        );
      } else {
        setUsername("");
      }
    };

    fetchUser();

    // 🔹 Listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user || null;
        setUser(newUser);

        if (newUser) {
          const { data: profileData } = await supabase
            .from("users")
            .select("username")
            .eq("id", newUser.id)
            .maybeSingle();

          setUsername(
            profileData?.username ||
              newUser.user_metadata?.username ||
              ""
          );
        } else {
          setUsername("");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Menu Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-blue-100 transition duration-200"
          aria-label="Open Menu"
        >
          <FaBars className="text-blue-600" size={18} />
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-lg border-r border-gray-100 shadow-2xl z-50 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-blue-600">
            {username || "User"}
          </h2>
          <button onClick={() => setMenuOpen(false)}>
            <FaTimes className="text-gray-500 hover:text-blue-600" size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-5 space-y-5 text-gray-700">
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 hover:text-blue-600 transition"
          >
            <FaUserEdit size={18} /> Edit Profile
          </Link>

          {username && (
            <Link
              to={`/profile/${username}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 hover:text-blue-600 transition"
            >
              <FaUser size={18} /> View Profile
            </Link>
          )}

          <Link
            to="/forgot-password"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 hover:text-blue-600 transition"
          >
            <FaKey size={18} /> Forgot Password
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 hover:text-red-600 transition"
          >
            <FaSignOutAlt size={18} /> Logout
          </button>
        </nav>

        <div className="absolute bottom-6 left-0 w-full text-center text-xs text-gray-400">
          <p>
            Powered by <span className="text-blue-600">Tapinfi Solutions Pvt Ltd</span>
          </p>
        </div>
      </div>
    </>
  );
}
