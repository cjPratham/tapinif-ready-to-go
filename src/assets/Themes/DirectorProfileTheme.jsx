import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  FaPhoneAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
  FaShareAlt,
  FaArrowLeft
} from "react-icons/fa";
import { MdEmail, MdInsertDriveFile } from "react-icons/md";
import AddToContactsButton from "../../components/AddToContactButton";
import SaveProfileButton from "../../components/SaveProfileButton";

export default function DirectorProfileTheme() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("users")
        .select(
          `full_name, username, role, company, about, profile_pic_url, cover_pic_url,
           phone_number, user_email, website_url, portfolio_url, facebook_url, instagram_url,
           linkedin_url, twitter_url, whatsapp_url`
        )
        .eq("username", username)
        .single();

      if (error) console.error("Profile fetch error:", error.message);
      else setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [username]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  if (!profile)
    return <p className="text-center mt-10 text-red-500">Profile not found.</p>;

  const {
    full_name,
    role,
    company,
    about,
    profile_pic_url,
    cover_pic_url,
    phone_number,
    user_email,
    website_url,
    portfolio_url,
    facebook_url,
    instagram_url,
    linkedin_url,
    twitter_url,
    whatsapp_url,
  } = profile;

  // ✅ Handle Profile Share
  const handleShare = async () => {
    const shareData = {
      title: `${full_name || "Tapinfi User"}'s Profile`,
      text: `Check out ${full_name || "this professional"} on Tapinfi.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("✅ Profile link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-1 px-3">
      {/* CARD WRAPPER */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
        {/* HEADER */}
        
        <div
          className="relative flex flex-col items-center text-center pb-6"
          style={{ background: "#E7ECF5", borderBottomRightRadius: "40px" }}
        >
          {/* Cover Image */}
          {cover_pic_url && (
            <img
              src={cover_pic_url}
              alt="Cover"
              className="w-full h-40 object-cover"
            />
          )}

          {/* Share + Save Buttons */}
         <div className="absolute top-3 right-3 flex gap-3">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center 
                      bg-white/20 backdrop-blur-md text-white rounded-full 
                      hover:bg-white/30 transition duration-200 shadow-md"
            aria-label="Share Profile"
          >
            <FaShareAlt size={18} />
          </button>
          {/* <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[white] hover:bg-white/50 transition"
          aria-label="Go back"
        >
          <FaArrowLeft size={18} />
        </button> */}

          {/* Save to Wallet Button */}
          <SaveProfileButton profileUsername={profile.username} />
         </div>

          {/* Profile Image */}
          <div className="mt-[-2.5rem] w-28 h-28 rounded-full bg-white p-1 shadow-md">
            <img
              src={profile_pic_url}
              alt={full_name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Info */}
          <h2 className="text-xl font-bold mt-3">{full_name}</h2>
          <p className="text-gray-700 font-medium">{role}</p>
          <p className="text-gray-500">{company}</p>

          {/* Contact Icons */}
          <div className="flex items-center justify-center gap-14 mt-4">
            {phone_number && (
              <a
                href={`tel:${phone_number}`}
                className="bg-blue-500 text-white p-3 rounded-full shadow hover:bg-blue-600"
              >
                <FaPhoneAlt size={18} />
              </a>
            )}
            {user_email && (
              <a
                href={`mailto:${user_email}`}
                className="bg-blue-500 text-white p-3 rounded-full shadow hover:bg-blue-600"
              >
                <MdEmail size={20} />
              </a>
            )}
            {website_url && (
              <a
                href={website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white p-3 rounded-full shadow hover:bg-blue-600"
              >
                <FaGlobe size={20} />
              </a>
            )}
          </div>

          {/* Add Contact Button */}
          <div className="mt-5">
            <AddToContactsButton
              name={full_name}
              phone={phone_number}
              company={company}
              profileUrl={`https://tapinfi.com/profile/${username}`}
            />
          </div>
        </div>

        {/* ABOUT */}
        <div className="px-6 py-6">
          {about && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">About {full_name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{about}</p>
            </div>
          )}

          {/* PORTFOLIO */}
          {portfolio_url && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Company’s Portfolio</h3>
              <a
                href={portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-gray-50 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <MdInsertDriveFile size={22} className="text-gray-700" />
                  <span className="text-gray-800 font-medium text-sm">
                    View Portfolio
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* SOCIAL LINKS */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Social Links</h3>
            <div className="flex gap-4 flex-wrap">
              {facebook_url && (
                <a
                  href={facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-xl shadow hover:shadow-md"
                >
                  <FaFacebook size={20} className="text-blue-600" />
                </a>
              )}
              {instagram_url && (
                <a
                  href={instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-xl shadow hover:shadow-md"
                >
                  <FaInstagram size={20} className="text-pink-500" />
                </a>
              )}
              {linkedin_url && (
                <a
                  href={linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-xl shadow hover:shadow-md"
                >
                  <FaLinkedin size={20} className="text-blue-700" />
                </a>
              )}
              {twitter_url && (
                <a
                  href={twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-xl shadow hover:shadow-md"
                >
                  <FaTwitter size={20} className="text-black" />
                </a>
              )}
              {whatsapp_url && (
                <a
                  href={whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-xl shadow hover:shadow-md"
                >
                  <FaWhatsapp size={20} className="text-green-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-500 pb-5">
         Powered by : <span className="font-semibold text-blue"><a target="_blank" href="http://tapinfi.com">Tapinfi Solutions Pvt Ltd</a></span>
        </footer>
      </div>
    </div>
  );
}
