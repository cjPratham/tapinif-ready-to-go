import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaBookmark } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function SaveProfileButton({ profileUsername }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [walletMember, setWalletMember] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(res => {
      setUser(res.data?.user || null);
    });
  }, []);

  // Check wallet membership
  useEffect(() => {
    if (!user) return;
    const checkWallet = async () => {
      const { data } = await supabase
        .from("wallet_users")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setWalletMember(!!data);
    };
    checkWallet();
  }, [user]);

  // Check if profile already saved
  useEffect(() => {
    if (!user) return;
    const checkSaved = async () => {
      const { data } = await supabase
        .from("wallet_cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("card_username", profileUsername)
        .single();
      if (data) setSaved(true);
    };
    checkSaved();
  }, [user, profileUsername]);

  const handleSave = async () => {
    if (!user) {
      // Redirect to login with return path
      navigate("/", { state: { redirectTo: window.location.pathname } });
      return;
    }

    if (!walletMember) {
      // Redirect to wallet auth with return path
      navigate("/wallet/auth", { state: { redirectTo: window.location.pathname } });
      return;
    }

    if (saved) {
      alert("✅ You have already saved this profile!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("wallet_cards")
        .insert([{ user_id: user.id, card_username: profileUsername }]);

      if (error) throw error;

      setSaved(true);
      alert("✅ Profile saved to your wallet!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition duration-200 shadow-md ${
        saved ? "bg-green-500 hover:bg-green-600" : ""
      }`}
      aria-label={saved ? "Saved" : "Save Profile"}
    >
      <FaBookmark size={18} />
    </button>
  );
}
