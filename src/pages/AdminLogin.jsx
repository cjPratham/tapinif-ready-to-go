// src/pages/AdminLogin.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return setError(error.message);

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (profile?.is_admin) {
      navigate("/admin/dashboard");
    } else {
      setError("You are not authorized to access the admin dashboard.");
      await supabase.auth.signOut();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          Tapinfi Admin Panel
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Only authorized users can log in
        </p>

        <form onSubmit={handleAdminLogin} className="flex flex-col space-y-3">
          <input
            type="email"
            placeholder="Admin Email"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
