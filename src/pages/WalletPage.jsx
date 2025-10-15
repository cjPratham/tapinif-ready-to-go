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
  const pageSize = 5;
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
          .select("username, full_name, profile_pic_url, role, company, phone_number")
          .in("username", usernames)
          .eq("publish", true);

        if (profilesError) throw profilesError;

        // Sort by last viewed order
        const viewedProfiles = JSON.parse(localStorage.getItem("viewedProfiles") || "[]");
        const sortedProfiles = [...profiles].sort((a, b) => {
          const indexA = viewedProfiles.indexOf(a.username);
          const indexB = viewedProfiles.indexOf(b.username);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCards(sortedProfiles);
        setFilteredCards(sortedProfiles);
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
      c.company?.toLowerCase().includes(term) ||
      c.phone_number?.toLowerCase().includes(term)
    );

    setFilteredCards(filtered);
    setCurrentPage(1);
  }, [search, cards]);

  // -------------------------------
  // Pagination
  // -------------------------------
  const totalPages = Math.ceil(filteredCards.length / pageSize);
  const currentCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // -------------------------------
  // Handle profile click (track last viewed)
  // -------------------------------
  const handleProfileClick = (username) => {
    const viewedProfiles = JSON.parse(localStorage.getItem("viewedProfiles") || "[]");
    const updated = [username, ...viewedProfiles.filter(u => u !== username)];
    localStorage.setItem("viewedProfiles", JSON.stringify(updated));
  };

  // -------------------------------
  // Render
  // -------------------------------
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  if (!user) return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-2">Login Required</h2>
      <p className="text-gray-500">You must be logged in to access your Tapinfi Wallet.</p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl text-center font-bold mb-4 text-blue-700">Tapinfi Wallet</h2>

      {/* Sticky Search */}
      <div className="sticky top-0 bg-white z-10 pb-2">
        <input
          type="text"
          placeholder="Search by name, company, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
        />
      </div>

      {/* Profiles */}
      {currentCards.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg font-medium">No saved profiles found</p>
          <p className="text-sm">Try searching by name, company, or phone number</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {currentCards.map(card => (
            <li
              key={card.username}
              className="flex items-center justify-between gap-4 border p-4 rounded-2xl shadow-sm transition duration-200 bg-white hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <img
                  src={card.profile_pic_url || "https://via.placeholder.com/64?text=P"}
                  alt={card.full_name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{card.full_name || card.username}</p>
                  <p className="text-gray-600 text-sm">{card.role} {card.company && <>@ {card.company}</>}</p>
                  {card.phone_number && (
                    <p className="text-gray-500 text-sm">📞 {card.phone_number}</p>
                  )}
                  {card.username === JSON.parse(localStorage.getItem("viewedProfiles") || "[]")[0] && (
                    <span className="text-xs text-green-600 mt-1">Last visited</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <a
                  href={`/profile/${card.username}`}
                  onClick={() => handleProfileClick(card.username)}
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
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
