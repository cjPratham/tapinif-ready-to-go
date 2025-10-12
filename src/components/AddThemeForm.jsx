import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddThemeForm({ onThemeAdded }) {
  const [themeId, setThemeId] = useState("");
  const [themeName, setThemeName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTheme = async () => {
    if (!themeId || !themeName) {
      alert("Please fill both fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from("available_themes").insert([
      { id: themeId.trim(), name: themeName.trim() },
    ]);

    setLoading(false);

    if (error) {
      alert("Error adding theme: " + error.message);
    } else {
      setThemeId("");
      setThemeName("");
      onThemeAdded(); // refresh themes in AdminDashboard
    }
  };

  return (
    <div className="mb-6 p-4 bg-white shadow rounded-md flex gap-2 items-center">
      <input
        type="text"
        placeholder="Theme ID (JSX Component Name)"
        value={themeId}
        onChange={(e) => setThemeId(e.target.value)}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
      />
      <input
        type="text"
        placeholder="Theme Name"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
      />
      <button
        onClick={handleAddTheme}
        disabled={loading}
        className={`px-3 py-2 rounded-md text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Adding..." : "Add Theme"}
      </button>
    </div>
  );
}
