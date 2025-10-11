import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleConfirmation = async () => {
      const access_token = searchParams.get("access_token");
      if (!access_token) return;

      try {
        // Supabase auto-signs in with the token in URL
        await supabase.auth.getSession();
        console.log("✅ Email confirmed successfully!");
      } catch (error) {
        console.error("Error confirming email:", error.message || error);
      }

      // Countdown timer for redirect
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            navigate("/");
          }
          return prev - 1;
        });
      }, 1000);
    };

    handleConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white text-center">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-green-500 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-blue-700 mb-3">Email Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. <br />
          You’ll be redirected to the <span className="font-semibold text-blue-600">Login</span> page
          in <span className="font-semibold">{countdown}</span> seconds.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
}
