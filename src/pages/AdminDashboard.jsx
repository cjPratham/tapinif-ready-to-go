import { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import AddThemeForm from "../components/AddThemeForm";
import { supabase } from "../lib/supabaseClient";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [userThemes, setUserThemes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchAvailableThemes();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from("users").select("*");
    setUsers(data);
    fetchUserThemes();
    setLoading(false);
  }

  async function fetchAvailableThemes() {
    const { data } = await supabase.from("available_themes").select("*");
    setAvailableThemes(data);
  }

  async function fetchUserThemes() {
    const { data } = await supabase.from("user_themes").select("*");
    const mapping = {};
    data.forEach((ut) => {
      if (!mapping[ut.user_id]) mapping[ut.user_id] = [];
      mapping[ut.user_id].push({ theme_id: ut.theme_id });
    });
    setUserThemes(mapping);
  }

  const togglePublish = async (userId, currentValue) => {
    await supabase.from("users").update({ publish: !currentValue }).eq("id", userId);
    fetchUsers();
  };

  // Toggle theme assignment
const toggleTheme = async (userId, themeId) => {
  const userHasTheme = userThemes[userId]?.some(t => t.theme_id === themeId);

  if (userHasTheme) {
    // Remove theme
    await supabase.from("user_themes").delete().eq("user_id", userId).eq("theme_id", themeId);
  } else {
    // Assign theme
    await supabase.from("user_themes").insert({ user_id: userId, theme_id: themeId, applied: false });
  }

  // Update userThemes locally for instant UI update
  setUserThemes(prev => {
    const updated = { ...prev };
    if (!updated[userId]) updated[userId] = [];

    if (userHasTheme) {
      updated[userId] = updated[userId].filter(t => t.theme_id !== themeId);
    } else {
      updated[userId].push({ theme_id: themeId, applied: false });
    }
    return updated;
  });
};


  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-blue-600 mb-6">Admin Dashboard</h1>
      <AddThemeForm onThemeAdded={fetchAvailableThemes} />
      <UsersList
        users={users}
        userThemes={userThemes}
        availableThemes={availableThemes}
        togglePublish={togglePublish}
        toggleTheme={toggleTheme}
      />
    </div>
  );
}
