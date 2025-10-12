import AddToContactsButton from "../../components/AddToContactButton";
import SaveProfileButton from "../../components/SaveProfileButton";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaShareAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* -----------------------------
   Helpers
----------------------------- */
const getContactLink = (type, value) => {
  if (!value) return null;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  if (type === "email") return `mailto:${value}`;
  return value.startsWith("http") ? value : `https://${value}`;
};

const ContactIcon = ({ url, icon: Icon, bgColor, label }) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-12 h-12 flex items-center justify-center rounded-full ${bgColor} text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200`}
      aria-label={label}
    >
      <Icon size={20} />
    </a>
  ) : null;

const SectionCard = ({ title, children }) =>
  children ? (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  ) : null;

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
        className="block w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-gray-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition duration-150 flex items-center justify-between"
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
    { key: "instagram_url", bgColor: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600", label: "Instagram", icon: FaInstagram },
    { key: "twitter_url", bgColor: "bg-black", label: "X (Twitter)", icon: FaXTwitter },
    { key: "whatsapp_url", bgColor: "bg-[#25D366]", label: "WhatsApp", icon: FaWhatsapp },
    { key: "facebook_url", bgColor: "bg-[#1877F2]", label: "Facebook", icon: FaFacebook },
  ];

  const links = socialMap
    .filter((link) => profile[link.key])
    .map((link) => ({ ...link, url: getContactLink("social", profile[link.key]) }));

  if (!links.length) return null;

  return (
    <SectionCard title="Connect Digitally">
      <div className="flex flex-wrap gap-4 justify-start">
        {links.map((link, i) => (
          <ContactIcon key={i} {...link} />
        ))}
      </div>
    </SectionCard>
  );
};

const ProfileHeader = ({ profile }) => {
  const contactActions = [
    { url: getContactLink("phone", profile.phone_number), icon: FaPhone, label: "Call" },
    { url: getContactLink("email", profile.user_email), icon: FaEnvelope, label: "Email" },
    { url: getContactLink("website", profile.website_url), icon: FaGlobe, label: "Website" },
  ].filter((a) => a.url);

  const handleShare = async () => {
    const shareData = {
      title: `${profile.full_name || "Tapinfi User"}'s Profile`,
      text: `Check out ${profile.full_name || "this professional"} on Tapinfi.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("✅ Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

  return (
    <div className="relative w-full">
      <div className="w-full h-52 sm:h-64 md:h-72 bg-gradient-to-r from-green-500 to-emerald-600" />

      <div className="absolute top-4 right-4 flex gap-3">
        <button
          onClick={handleShare}
          className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition duration-200 shadow-md"
          aria-label="Share Profile"
        >
          <FaShareAlt size={18} />
        </button>

        <SaveProfileButton profileUsername={profile.username} />
      </div>

      <div className="relative -mt-16 flex flex-col items-center text-center px-4 pb-8">
        <img
          src={profile.profile_pic_url || "https://via.placeholder.com/128/FFFFFF/3B82F6?text=P"}
          alt={profile.full_name}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mb-3"
        />
        <h1 className="text-3xl font-semibold text-white leading-tight">{profile.full_name || "Guest User"}</h1>
        {profile.role && <p className="text-lg text-white font-medium mt-1">{profile.role}</p>}
        {profile.company && <p className="text-sm text-white">{profile.company}</p>}

        {contactActions.length > 0 && (
          <div className="flex space-x-4 mt-4 justify-center">
            {contactActions.map((action, i) => (
              <ContactIcon key={i} {...action} bgColor="bg-white/20" />
            ))}
          </div>
        )}

        <AddToContactsButton
          name={profile.full_name}
          phone={profile.phone_number}
          company={profile.company}
          profileUrl={`https://tapinfi.com/profile/${profile.username}`}
        />
      </div>
    </div>
  );
};

/* -----------------------------------------
   Main Theme Component
----------------------------------------- */
export default function GreenProfile({ profile }) {
  if (!profile) return null;
  const firstName = profile.full_name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex flex-col items-center">
      <div className="w-full max-w-2xl shadow-2xl rounded-3xl overflow-hidden mt-8">
        <ProfileHeader profile={profile} />
        <div className="px-5 sm:px-8 mt-10">
          <AboutSection about={profile.about} firstName={firstName} />
          <PortfolioSection portfolioUrl={profile.portfolio_url} />
          <SocialLinks profile={profile} />
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 text-center bg-white/70 rounded-b-3xl">
          <p className="text-sm tracking-wide pb-3">
            <span className="text-green-600 font-semibold">Powered by</span>{" "}
            <span className="text-gray-700 font-medium">Tapinfi Solutions Pvt Ltd.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
