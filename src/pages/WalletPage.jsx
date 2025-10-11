import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [walletUser, setWalletUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of profiles per page
  const navigate = useNavigate();

  // -------------------------------
  // Auth check
  // -------------------------------
  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user || null);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // -------------------------------
  // Ensure wallet membership
  // -------------------------------
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ensureWalletUser = async () => {
      try {
        const { data: existingWallet, error } = await supabase
          .from("wallet_users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (existingWallet) {
          setWalletUser(existingWallet);
        } else {
          const { data: profileData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", user.id)
            .single();

          const { data: cardData } = await supabase
            .from("wallet_cards")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          const isCardOwner = cardData?.length > 0;

          const { data: newWalletUser, error: insertError } = await supabase
            .from("wallet_users")
            .insert([{
              user_id: user.id,
              full_name: profileData?.full_name || "",
              email: profileData?.email || user.email,
              is_card_owner: isCardOwner,
            }])
            .select()
            .single();

          if (insertError) throw insertError;

          setWalletUser(newWalletUser);
        }
      } catch (err) {
        console.error("Error ensuring wallet user:", err);
        alert("Failed to join Wallet. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    ensureWalletUser();
  }, [user]);

  // -------------------------------
  // Fetch saved wallet profiles
  // -------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchCards = async () => {
      try {
        const { data: walletData, error: walletError } = await supabase
          .from("wallet_cards")
          .select("card_username")
          .eq("user_id", user.id);

        if (walletError) throw walletError;

        const usernames = walletData.map(c => c.card_username);
        if (usernames.length === 0) {
          setCards([]);
          setFilteredCards([]);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("users")
          .select("username, full_name, profile_pic_url, role, company")
          .in("username", usernames)
          .eq("publish", true);

        if (profilesError) throw profilesError;

        setCards(profiles);
        setFilteredCards(profiles);
      } catch (err) {
        console.error("Error fetching wallet profiles:", err);
      }
    };

    fetchCards();
  }, [user]);

  // -------------------------------
  // Handle search
  // -------------------------------
  useEffect(() => {
    if (!search) {
      setFilteredCards(cards);
      setCurrentPage(1);
      return;
    }

    const term = search.toLowerCase();
    const filtered = cards.filter(c =>
      c.full_name?.toLowerCase().includes(term) ||
      c.username?.toLowerCase().includes(term) ||
      c.role?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    );

    setFilteredCards(filtered);
    setCurrentPage(1);
  }, [search, cards]);

  // -------------------------------
  // Pagination
  // -------------------------------
  const totalPages = Math.ceil(filteredCards.length / pageSize);
  const currentCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return (
    <p className="text-center mt-10 text-xl text-blue-600 animate-pulse">Loading Wallet...</p>
  );

  if (!user) return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-2">Login Required</h2>
      <p className="text-gray-500">You must be logged in to access your Tapinfi Wallet.</p>
      <button
        onClick={() => navigate("/login")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl text-center font-bold mb-4 text-blue-700">Tapinfi Wallet</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search saved profiles..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none mb-6"
      />

      {/* Profiles */}
      {currentCards.length === 0 ? (
        <p className="text-gray-500 text-center">No profiles found.</p>
      ) : (
        <ul className="space-y-4">
          {currentCards.map(card => (
            <li key={card.username} className="flex items-center gap-4 border p-4 rounded-xl shadow hover:shadow-lg transition duration-200">
              <img
                src={card.profile_pic_url || "https://via.placeholder.com/64/FFFFFF/3B82F6?text=P"}
                alt={card.full_name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{card.full_name || card.username}</p>
                {card.role && <p className="text-gray-600 text-sm">{card.role}</p>}
                {card.company && <p className="text-gray-500 text-sm">{card.company}</p>}
              </div>
              <div>
                <a
                  href={`/profile/${card.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View Profile
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
