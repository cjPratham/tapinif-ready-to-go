import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

  // -------------------------------
  // Handle SignUp/Login
  // -------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setShowResend(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm-email`,
          },
        });
        if (error) throw error;
        setMessage(
          "Sign-up successful. Check your email for a verification link."
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("email not confirmed")) {
            setShowResend(true);
            setError("Email not confirmed. Please check your inbox.");
          } else throw error;
        } else if (data.session) {
          navigate("/profile");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // -------------------------------
  // Resend Confirmation Email
  // -------------------------------
  const handleResendEmail = async () => {
    setError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) setError(error.message);
    else setMessage("Confirmation email resent! Check your inbox.");
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 p-4">
      <div className="relative bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-8 w-full max-w-sm">
        {/* Tapinfi Logo / Title */}
        <h1 className="text-3xl font-extrabold text-center mb-2 text-blue-700 tracking-wide">
          Tapinfi
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          {isSignUp ? "Join our Network" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Resend Email */}
        {showResend && (
          <p
            className="text-center text-sm mt-3 text-blue-600 cursor-pointer hover:underline"
            onClick={handleResendEmail}
          >
            Resend Confirmation Email
          </p>
        )}

        {/* Forgot Password */}
        {!isSignUp && (
          <p
            className="text-center text-sm mt-3 text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>
        )}

        {/* Switch between login/signup */}
        <p
          className="text-center text-sm mt-5 text-gray-700 cursor-pointer hover:text-blue-600"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Login"
            : "New user? Sign Up"}
        </p>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <span className="text-blue-600 font-medium">Tapinfi Solutions Pvt Ltd</span>
        </div>

        {/* Subtle decorative blur */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/30 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
