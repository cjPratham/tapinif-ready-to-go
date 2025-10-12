import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaPalette } from "react-icons/fa";

export default function MyThemes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  // Fetch themes once we have user
  useEffect(() => {
    if (currentUser) fetchThemes();
  }, [currentUser]);

  async function fetchThemes() {
    setLoading(true);
    try {
      // 1️⃣ Get user's applied theme
      const { data: userData } = await supabase
        .from("users")
        .select("themeid")
        .eq("id", currentUser.id)
        .maybeSingle(); // safe

      const appliedThemeId = userData?.themeid || null;

      // 2️⃣ Get assigned themes
      const { data: userAssignments } = await supabase
        .from("user_themes")
        .select("theme_id")
        .eq("user_id", currentUser.id);

      const assignedIds = userAssignments?.map((t) => t.theme_id) || [];

      // 3️⃣ Get available themes
      const { data: allThemes } = await supabase
        .from("available_themes")
        .select("*")
        .in("id", assignedIds);

      // 4️⃣ Combine applied info
      const combined = allThemes.map((theme) => ({
        ...theme,
        applied: theme.id === appliedThemeId,
      }));

      setThemes(combined);
    } catch (err) {
      console.error("Error fetching themes:", err.message);
    }
    setLoading(false);
  }

  async function applyTheme(themeId) {
  setApplyingId(themeId);
  try {
    // 1️⃣ Reset all user's theme assignments to applied = false
    await supabase
      .from("user_themes")
      .update({ applied: false })
      .eq("user_id", currentUser.id);

    // 2️⃣ Set applied = true for the selected theme
    await supabase
      .from("user_themes")
      .update({ applied: true })
      .eq("user_id", currentUser.id)
      .eq("theme_id", themeId);

    // 3️⃣ Update user's themeid
    await supabase
      .from("users")
      .update({ themeid: themeId })
      .eq("id", currentUser.id);

    // Refresh themes
    fetchThemes();
  } catch (err) {
    console.error("Error applying theme:", err.message);
  }
  setApplyingId(null);
}


  if (!currentUser) return <p className="text-center mt-10">Loading user...</p>;
  if (loading) return <p className="text-center mt-10">Loading your themes...</p>;
  if (themes.length === 0)
    return <p className="text-center mt-10 text-gray-500">No themes assigned yet.</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-blue-600 text-center">My Themes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`p-4 rounded-lg shadow-md border ${
              theme.applied ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FaPalette size={16} className="text-blue-500" />
              <span className="font-medium">{theme.name}</span>
            </div>

            <button
              onClick={() => applyTheme(theme.id)}
              disabled={theme.applied || applyingId === theme.id}
              className={`w-full px-3 py-2 rounded-md text-white ${
                theme.applied
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {theme.applied
                ? "Applied"
                : applyingId === theme.id
                ? "Applying..."
                : "Apply"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
