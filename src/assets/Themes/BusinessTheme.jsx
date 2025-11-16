// src/assets/Themes/BusinessCardTheme.jsx
import React from "react";
import {
  FaShareAlt,
  FaArrowLeft,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaRegBookmark,
} from "react-icons/fa";
import {
  IoCallOutline,
  IoMailOutline,
  IoGlobeOutline
} from "react-icons/io5";
import {
  FaXTwitter
} from "react-icons/fa6";

import { MdInsertDriveFile } from "react-icons/md";

/** Inline X (Twitter -> X) icon (small, centered) */
function XIcon({ size = 16, className = "" }) {
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

export default function BusinessCardTheme({ profile }) {
  if (!profile) return null;

  // fallback add-to-contact handler (downloads vcf)
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
    link.download = `${(profile.full_name || "contact").replace(/\s+/g, "_")}.vcf`;
    link.click();
  };

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
  { href: phone_number ? `tel:${phone_number}` : null, Icon: IoCallOutline, label: "Call" },
  { href: user_email ? `mailto:${user_email}` : null, Icon: IoMailOutline, label: "Email" },
  {
    href: website_url
      ? website_url.startsWith("http")
        ? website_url
        : `https://${website_url}`
      : null,
    Icon: IoGlobeOutline,
    label: "Website",
  },
];


  const socialList = [
    { key: "instagram", url: instagram_url, Icon: FaInstagram },
    { key: "linkedin", url: linkedin_url, Icon: FaLinkedinIn },
    { key: "x", url: twitter_url, Icon: FaXTwitter },
    { key: "whatsapp", url: whatsapp_url, Icon: FaWhatsapp },
  ];

  return (
    <div className="min-h-screen bg-whitesmoke flex items-start justify-center py-2">
      <div className="w-full max-w-sm bg-[#F3F8FB] rounded-xl shadow-2xl overflow-hidden">
        {/* Back arrow (purple) */}
        <div className="px-4 pt-4">
          <button
            onClick={() => window.history.back()}
            aria-label="Back"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#6B5AE0] hover:bg-white/5"
          >
            <FaArrowLeft size={16} />
          </button>
        </div>

        {/* Info panel */}
        <div className="px-4 pb-4 pt-2">
          <div className="bg-white rounded-2xl p-4 shadow-sm relative">
            {/* Share + Save (outlined) */}
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                onClick={handleShare}
                aria-label="Share"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E6EEF8] shadow-sm"
                title="Share"
              >
                <FaShareAlt size={14} className="text-[#2f3e63]" />
              </button>

              <button
                onClick={handleSave}
                aria-label="Save"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E6EEF8] shadow-sm"
                title="Save"
              >
                <FaRegBookmark size={14} className="text-[#2f3e63]" />
              </button>
            </div>

            {/* Avatar + name/role */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#EEF3F8] bg-gray-100 flex-shrink-0">
                <img
                  src={profile_pic_url || "https://via.placeholder.com/150"}
                  alt={full_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-gray-900">{full_name}</h3>
                {role && <p className="text-sm text-gray-500 mt-1">{role}</p>}
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-4 flex items-center justify-between gap-3">
              {/* Add to Contacts — solid single purple color, responsive */}
              <div className="flex-1 pr-3">
                {/* If your AddToContactsButton can be styled, you can keep using it.
                    For guaranteed control and spacing we use an inline button here. */}
                <button
                  onClick={handleAddToContacts}
                  aria-label="Add contact"
                  className="
                    w-full
                    sm:w-full
                    md:w-full
                    lg:w-full
                    py-2
                    px-6
                    rounded-lg
                    font-semibold
                    text-white
                    shadow-md
                    focus:outline-none focus:ring-2 focus:ring-[#6B5AE0]/30
                    transition transform duration-150
                    hover:-translate-y-0.5 hover:shadow-lg
                  "
                  style={{ background: "#6B5AE0" }} // single color like back arrow
                >
                  Add Contact
                </button>
              </div>

              {/* Contact icons — square outline with shadow, smaller logos */}
              <div className="flex items-center gap-3">
                {contactActions.map(({ href, Icon, label }, i) => (
                  <a
                    key={i}
                    href={href || "#"}
                    onClick={(e) => !href && e.preventDefault()}
                    aria-label={label}
                    title={label}
                    className="
                      w-10 h-10
                      flex items-center justify-center
                      rounded-full
                      bg-white
                      border border-[#6B5AE0]   /* working purple */
                      shadow-sm
                    "
                  >
                    <Icon 
                      size={20}                     /* bigger icon */
                      className="text-[#6B5AE0]"   /* icon in purple */
                    />
                  </a>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="px-4 pb-6 text-sm text-gray-700">
          {about && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">About {firstName}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{about}</p>
            </div>
          )}

          {company && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Company’s Details</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{company}</p>
            </div>
          )}

          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Social Links</h4>

            <div className="grid grid-cols-4 gap-3">
              {socialList.map(({ key, url, Icon }) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      h-18
                      flex items-center justify-center
                      rounded-lg
                      bg-[#F8FAFE]
                      border border-[#D8E1F0]
                      shadow-sm
                      transition
                    "
                    title={key}
                  >
                    {/* Proper icon size & color */}
                    {typeof Icon === "function" ? (
                      <Icon size={30} className="text-[#7A8CB2]" />
                    ) : (
                      <Icon size={22} className="text-[#7A8CB2]" />
                    )}
                  </a>
                ) : (
                  null
                )
              )}
            </div>
          </div>


          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Essential Documents</h4>
            {portfolio_url && (
              <a
                href={portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-3 bg-white rounded-xl border border-[#E8F0FA] shadow-sm mb-3"
              >
                <div className="flex items-center gap-3">
                  <MdInsertDriveFile size={20} className="text-[#9AAED1]" />
                  <span className="font-medium text-gray-800">Portfolio</span>
                </div>
                <span className="text-gray-400">›</span>
              </a>
            )}

            {pitch_deck_url && (
              <a
                href={pitch_deck_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-3 bg-white rounded-xl border border-[#E8F0FA] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <MdInsertDriveFile size={20} className="text-[#9AAED1]" />
                  <span className="font-medium text-gray-800">Company Pitch deck.pdf</span>
                </div>
                <span className="text-gray-400">›</span>
              </a>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Powered by : <span className="font-semibold text-[#355a9a]">Tapinfi Solutions Pvt Ltd</span>
          </div>
        </div>
      </div>
    </div>
  );
}
