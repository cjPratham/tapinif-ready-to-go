import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setLoading(false);
      } else if (event === "SIGNED_IN" && session) {
        setLoading(false);
      }
    });

    // unsubscribe correctly
    return () => data.subscription.unsubscribe();
  }, []);


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return;

    setError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-80">
        <h2 className="text-center text-xl font-semibold mb-4">Reset Password</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-2">{message}</p>}

        {!error && (
          <form onSubmit={handleUpdatePassword} className="flex flex-col space-y-3">
            <input
              type="password"
              placeholder="New Password"
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
