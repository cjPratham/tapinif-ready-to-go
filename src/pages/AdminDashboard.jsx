import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import UsersList from "../components/UsersList";
import AddThemeForm from "../components/AddThemeForm";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [userThemes, setUserThemes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  // -------------------------------
  // Auth check on mount
  // -------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      // Optional: verify admin role
      const { data: user } = await supabase
        .from("users")
        .select("id, is_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!user?.is_admin) {
        navigate("/admin/login", { replace: true });
        return;
      }

      fetchAllData();
    };

    checkAuth();
  }, [navigate]);

  // -------------------------------
  // Fetch all required data
  // -------------------------------
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchAvailableThemes()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    setUsers(data || []);
    await fetchUserThemes();
  };

  const fetchAvailableThemes = async () => {
    const { data } = await supabase.from("available_themes").select("*");
    setAvailableThemes(data || []);
  };

  const fetchUserThemes = async () => {
    const { data } = await supabase.from("user_themes").select("*");
    const mapping = {};
    (data || []).forEach((ut) => {
      if (!mapping[ut.user_id]) mapping[ut.user_id] = [];
      mapping[ut.user_id].push({ theme_id: ut.theme_id, applied: ut.applied });
    });
    setUserThemes(mapping);
  };

  // -------------------------------
  // Toggle user publish status
  // -------------------------------
  const togglePublish = async (userId, currentValue) => {
    await supabase.from("users").update({ publish: !currentValue }).eq("id", userId);
    fetchUsers();
  };

  // -------------------------------
  // Toggle theme assignment
  // -------------------------------
  const toggleTheme = async (userId, themeId) => {
    const userHasTheme = userThemes[userId]?.some((t) => t.theme_id === themeId);

    if (userHasTheme) {
      await supabase.from("user_themes").delete().eq("user_id", userId).eq("theme_id", themeId);
    } else {
      await supabase.from("user_themes").insert({ user_id: userId, theme_id: themeId, applied: false });
    }

    setUserThemes((prev) => {
      const updated = { ...prev };
      if (!updated[userId]) updated[userId] = [];
      if (userHasTheme) {
        updated[userId] = updated[userId].filter((t) => t.theme_id !== themeId);
      } else {
        updated[userId].push({ theme_id: themeId, applied: false });
      }
      return updated;
    });
  };

  // -------------------------------
  // Search & pagination
  // -------------------------------
  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const currentUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) return <p className="text-center mt-10">Loading admin dashboard...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-blue-600">Admin Dashboard</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Theme Form */}
      <AddThemeForm onThemeAdded={fetchAvailableThemes} />

      {/* Users List */}
      <UsersList
        users={currentUsers}
        userThemes={userThemes}
        availableThemes={availableThemes}
        togglePublish={togglePublish}
        toggleTheme={toggleTheme}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
