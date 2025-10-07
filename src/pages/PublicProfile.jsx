import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import UnpublishedProfile from "../components/UnpublishedProfile";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaShareAlt
} from "react-icons/fa";


// ----------------------------
// HELPERS
// ----------------------------
const getContactLink = (type, value) => {
  if (!value) return null;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  if (type === "email") return `mailto:${value}`;
  return value.startsWith("http") ? value : `https://${value}`;
};

// ----------------------------
// SMALL COMPONENTS
// ----------------------------
const ContactIcon = ({ url, icon: Icon, bgColor, label }) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-12 h-12 flex items-center justify-center rounded-full ${bgColor} text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`}
      aria-label={label}
    >
      <Icon size={20} />
    </a>
  ) : null;

const SectionCard = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-6 border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
    {children}
  </div>
);

const AboutSection = ({ about, firstName }) =>
  about ? (
    <SectionCard title={`About ${firstName}`}>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{about}</p>
    </SectionCard>
  ) : null;

const PortfolioSection = ({ portfolioUrl }) => {
  if (!portfolioUrl) return null;
  const link = getContactLink("portfolio", portfolioUrl);
  const fileName =
    portfolioUrl.split("/").pop().split("?")[0] || "View Portfolio / Pitch Deck";

  return (
    <SectionCard title="Key Documents">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition duration-150 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <FaGlobe className="text-gray-700" size={20} />
          <span className="font-semibold text-gray-700 truncate">{fileName}</span>
        </div>
        <span className="text-gray-500 text-lg">→</span>
      </a>
    </SectionCard>
  );
};

const SocialLinks = ({ profile }) => {
  const socialMap = [
    { key: "linkedin_url", bgColor: "bg-[#0A66C2]", label: "LinkedIn", icon: FaLinkedin },
    {
      key: "instagram_url",
      bgColor: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600",
      label: "Instagram",
      icon: FaInstagram,
    },
    { key: "twitter_url", bgColor: "bg-gray-800", label: "Twitter/X", icon: FaTwitter },
    { key: "whatsapp_url", bgColor: "bg-[#25D366]", label: "WhatsApp", icon: FaWhatsapp },
    { key: "facebook_url", bgColor: "bg-[#1877F2]", label: "Facebook", icon: FaFacebook },
  ];

  const links = socialMap
    .filter((link) => profile[link.key])
    .map((link) => ({ ...link, url: getContactLink("social", profile[link.key]) }));

  return links.length ? (
    <SectionCard title="Connect Digitally">
      <div className="flex flex-wrap gap-4 justify-start">
        {links.map((link, i) => (
          <ContactIcon key={i} {...link} />
        ))}
      </div>
    </SectionCard>
  ) : null;
};

// ----------------------------
// HEADER
// ----------------------------
const ProfileHeader = ({ profile }) => {
  const contactActions = [
    { url: profile.phone_number ? getContactLink("phone", profile.phone_number) : null, icon: FaPhone, label: "Call", bgColor: "bg-blue-500" },
    { url: profile.user_email ? getContactLink("email", profile.user_email) : null, icon: FaEnvelope, label: "Email", bgColor: "bg-green-500" },
    { url: profile.website_url ? getContactLink("website", profile.website_url) : null, icon: FaGlobe, label: "Website", bgColor: "bg-purple-500" },
  ].filter(action => action.url);

  const handleShare = async () => {
    const shareData = {
      title: `${profile.full_name}'s Profile`,
      text: `Check out ${profile.full_name}'s professional profile on Tapinfi.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

  return (
    <div className="relative pt-20 pb-24 px-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-3xl shadow-xl text-center -mt-6">
      {/* Share Icon */}
      <button
        onClick={handleShare}
        className="absolute top-15 right-5 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition duration-200 shadow-md"
        aria-label="Share Profile"
      >
        <FaShareAlt size={18} />
      </button>

      <img
        src={profile.profile_pic_url || "https://via.placeholder.com/128/FFFFFF/3B82F6?text=P"}
        alt={profile.full_name}
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mx-auto mb-3"
      />
      <h1 className="text-3xl font-medium text-white mb-1 leading-tight">
        {profile.full_name || "Guest User"}
      </h1>
      {profile.username && <p className="text-base text-blue-100 font-normal">@{profile.username}</p>}
      {profile.role && <p className="text-lg text-white font-semibold">{profile.role}</p>}
      {profile.company && <p className="text-md text-blue-200">{profile.company}</p>}

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex space-x-4 justify-center">
        {contactActions.map((action, index) => (
          <ContactIcon key={index} url={action.url} icon={action.icon} bgColor={action.bgColor} label={action.label} />
        ))}
      </div>
    </div>
  );
};


// ----------------------------
// MAIN
// ----------------------------
export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnpublished, setIsUnpublished] = useState(false);


useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "full_name, username, role, company, about, profile_pic_url, phone_number, user_email, website_url, portfolio_url, facebook_url, instagram_url, linkedin_url, twitter_url, whatsapp_url, publish, is_admin"
        )
        .eq("username", username)
        .single();

      if (error) throw error;

      // If profile is unpublished and user is not admin, show UnpublishedProfile
      if (!data.publish && !data.is_admin) {
        setProfile(null);       // clear any profile data
        setError(null);         // clear errors
        setLoading(false);
        setIsUnpublished(true); // new state to show <UnpublishedProfile />
        return;
      }

      // Profile is published
      setProfile(data);
      setIsUnpublished(false);
    } catch {
      setError("Could not load profile. It may not exist.");
      setProfile(null);
      setIsUnpublished(false);
    } finally {
      setLoading(false);
    }
  };

  if (username) fetchProfile();
  else {
    setError("No username provided.");
    setLoading(false);
  }
}, [username]);


  if (loading) return <p className="text-center mt-10 text-xl text-blue-600">Loading Profile...</p>;
  if (isUnpublished) return <UnpublishedProfile />;

  if (error || !profile)
    return (
      <p className="text-center mt-10 text-xl text-red-600">
        {error || "Profile not found."}
      </p>
    );

  const firstName = profile.full_name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-100 flex flex-col items-center">
      <div className="w-full max-w-lg shadow-xl rounded-3xl bg-white/70 backdrop-blur-sm overflow-hidden mt-[-20px]">
        
        <ProfileHeader profile={profile} />
        <div className="px-4 sm:px-6 mt-16">
          <AboutSection about={profile.about} firstName={firstName} />
          <PortfolioSection portfolioUrl={profile.portfolio_url} />
          <SocialLinks profile={profile} />
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm tracking-wide">
            <span className="text-blue-600 font-semibold">Powered by:</span>{" "}
            <span className="text-gray-700 font-medium"> Tapinfi Solutions Pvt Ltd.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
