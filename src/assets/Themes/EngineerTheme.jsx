// src/assets/Themes/EngineerTheme.jsx
import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaShareAlt,
  FaArrowLeft,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { MdInsertDriveFile } from "react-icons/md";
import SaveProfileButton from "../../components/SaveProfileButton";

/** Inline X icon (compact) */
function XIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.36 6.64a1 1 0 0 0-1.414-1.414L12 10.172 7.05 5.222A1 1 0 0 0 5.636 6.636L10.586 11.586 5.636 16.536a1 1 0 0 0 1.414 1.414L12 12.999l4.95 4.95a1 1 0 0 0 1.414-1.414L13.414 11.586l4.95-4.95z"
        fill="#2f3e63"
      />
    </svg>
  );
}

export default function EngineerTheme({ profile }) {
  if (!profile) return null;

  const {
    full_name,
    username,
    role,
    company,
    about,
    profile_pic_url,
    phone_number,
    user_email,
    website_url,
    instagram_url,
    linkedin_url,
    twitter_url,
    whatsapp_url,
    portfolio_url,
    pitch_deck_url,
  } = profile;

  const firstName = (full_name || "User").split(" ")[0];

  // user's provided vCard function (kept exactly as requested)
  const handleAddToContacts = () => {
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name || ""}
ORG:${profile.company || ""}
TITLE:${profile.role || ""}
TEL:${profile.phone_number || ""}
EMAIL:${profile.user_email || ""}
URL:${profile.website_url || ""}
END:VCARD
    `.trim();

    const blob = new Blob([vcard], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${profile.full_name || "contact"}.vcf`;
    link.click();
  };

  const handleShare = async () => {
    const payload = {
      title: `${full_name || "Profile"} • Tapinfi`,
      text: `${full_name || "Check this professional"} on Tapinfi.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    const key = `tapinfi_saved_${username || full_name}`;
    localStorage.setItem(key, window.location.href);
    alert("Saved");
  };

  const contactActions = [
    { href: phone_number ? `tel:${phone_number}` : null, Icon: FaPhoneAlt, label: "Call" },
    { href: user_email ? `mailto:${user_email}` : null, Icon: FaEnvelope, label: "Email" },
    {
      href: website_url
        ? website_url.startsWith("http")
          ? website_url
          : `https://${website_url}`
        : null,
      Icon: FaGlobe,
      label: "Website",
    },
  ];

  const socialList = [
    { key: "facebook", url: profile.facebook_url || "", Icon: FaFacebookF },
    { key: "instagram", url: instagram_url, Icon: FaInstagram },
    { key: "linkedin", url: linkedin_url, Icon: FaLinkedinIn },
    { key: "x", url: twitter_url, Icon: XIcon },
    { key: "whatsapp", url: whatsapp_url, Icon: FaWhatsapp },
  ];

  const accent = "#d8d5a7"; // user provided accent

  // only show documents section if at least one doc url present
  const hasDocs = Boolean(pitch_deck_url || portfolio_url);

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md lg:max-w-lg px-6 py-8">
        {/* top ribbon + back/share */}
        <div className="relative">
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-36 rounded-t-sm"
            style={{ background: accent, filter: "blur(0px)" }}
            aria-hidden="true"
          />

        <div className="flex items-start justify-between mb-6">
  {/* LEFT: Back Arrow */}
  <button
    onClick={() => window.history.back()}
    aria-label="Back"
    className="
      w-9 h-9 flex items-center justify-center rounded-full
      text-black bg-transparent
      hover:bg-black/5 transition
    "
  >
    <FaArrowLeft size={18} />
  </button>

  {/* RIGHT: Share + Save */}
  <div className="flex items-center gap-3">
    {/* Share Button */}
    <button
      onClick={handleShare}
      aria-label="Share Profile"
      className="
        w-9 h-9 flex items-center justify-center rounded-full
        bg-white border border-[#E6EEF8] shadow-sm
        hover:bg-gray-50 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-black/10
        transition
      "
    >
      <FaShareAlt size={16} className="text-black" />
    </button>

    {/* Save Button (using new SaveProfileButton with styling support) */}
    <SaveProfileButton
      profileUsername={profile.username}
      className="
        w-9 h-9 flex items-center justify-center rounded-full
        bg-white border border-[#E6EEF8] shadow-sm
        text-black
        hover:bg-gray-50 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-black/10
        transition
      "
    />
  </div>
</div>


          {/* image card (no border) */}
          <div className="flex justify-center">
            <div
              className="bg-white shadow-xl p-0 rounded-2xl overflow-hidden"
              style={{
                width: 200,
                height: 200,
                borderRadius: "22px",
                boxShadow: "0 25px 40px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={profile_pic_url || "https://via.placeholder.com/300"}
                alt={full_name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* name/title/company */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold text-[#111827]">{full_name}</h2>
          {role && <p className="mt-2 text-gray-500">{role}</p>}
          {company && <p className="mt-1 text-gray-400">{company}</p>}
        </div>

        {/* circular actions */}
        <div className="mt-8 flex items-center justify-center gap-12">
          {contactActions.map(({ href, Icon, label }, i) => (
            <a
              key={i}
              href={href || "#"}
              onClick={(e) => !href && e.preventDefault()}
              aria-label={label}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-md"
              style={{
                background: accent,
                boxShadow: "0 12px 24px rgba(140,140,140,0.08)",
              }}
              title={label}
            >
              <Icon size={20} className="text-white" />
            </a>
          ))}
        </div>

        {/* Add Contact button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAddToContacts}
            aria-label="Add Contact"
            className="px-10 py-3 rounded-xl font-semibold text-white shadow-xl"
            style={{
              background: accent,
              boxShadow: "0 20px 30px rgba(140,140,140,0.12)",
            }}
          >
            Add Contact
          </button>
        </div>

        {/* About section - header is just "About" and paragraph is justified */}
        {about && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-[#111827] mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed text-justify">{about}</p>
          </div>
        )}

        {/* Company portfolio - only visible when docs exist */}
        {hasDocs && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#111827] mb-3">Documents</h3>
            <a
              href={pitch_deck_url || portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <MdInsertDriveFile size={20} className="text-gray-400" />
                <span className="text-gray-800 font-medium">
                  {pitch_deck_url ? "Pitch deck.pdf" : "Portfolio"}
                </span>
              </div>
              <span className="text-gray-400">›</span>
            </a>
          </div>
        )}

        {/* Social Links */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Social Links</h3>

          <div className="flex items-center gap-3">
            {socialList.map(({ key, url, Icon }, i) =>
              url ? (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm"
                  title={key}
                >
                  {/* Brand color icons */}
                  {key === "facebook" && <FaFacebookF size={20} className="text-[#1877F2]" />}
                  {key === "instagram" && <FaInstagram size={20} className="text-[#E4405F]" />}
                  {key === "linkedin" && <FaLinkedinIn size={20} className="text-[#0A66C2]" />}
                  {key === "x" && <XIcon size={20} className="text-black" />}
                  {key === "whatsapp" && <FaWhatsapp size={20} className="text-[#25D366]" />}
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <span className="text-[#d8d5a7]">Powered by :</span>{" "}
          <a
            href="https://tapinfi.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#111827] ml-1"
          >
            Tapinfi Solutions Pvt Ltd
          </a>
        </div>
      </div>
    </div>
  );
}
