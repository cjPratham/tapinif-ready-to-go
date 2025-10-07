import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirmation = async () => {
      const access_token = searchParams.get("access_token");
      if (!access_token) return;

      // Supabase auto-signs in with the token in URL, so you can redirect
      navigate("/login"); // or wherever you want
    };

    handleConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold mb-4">Email Confirmed!</h1>
      <p>You can now login to your account.</p>
    </div>
  );
}
