import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaBookmark } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function SaveProfileButton({
  profileUsername,
  className = "",
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [walletMember, setWalletMember] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
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
        .maybeSingle();
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
        .maybeSingle();

      if (data) setSaved(true);
    };
    checkSaved();
  }, [user, profileUsername]);

  const handleSave = async () => {
    if (!user) {
      navigate("/", { state: { redirectTo: window.location.pathname } });
      return;
    }

    if (!walletMember) {
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

  /* -----------------------------
     DEFAULT BUTTON STYLE
     ----------------------------- */
  const defaultStyle = `
    w-9 h-9 flex items-center justify-center rounded-full
    bg-white text-black
    border border-[#E6EEF8] shadow-sm
    hover:shadow-md hover:bg-gray-50
    focus:outline-none focus:ring-2 focus:ring-black/10
    transition
  `;

  const savedStyle = `
    bg-green-500 text-black
    hover:bg-green-600
    border-none
  `;

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      aria-label={saved ? "Saved" : "Save Profile"}
      className={`${defaultStyle} ${saved ? savedStyle : ""} ${className}`}
    >
      <FaBookmark size={16} />
    </button>
  );
}
