import React from "react";
import {
  FaXTwitter
} from "react-icons/fa6";
import {
  FaEnvelope,
  FaInstagram,
  FaWhatsapp,
  FaShareAlt,
  FaArrowLeft,
  FaPhoneAlt,
  FaFacebookF,
  FaLinkedinIn,
  FaFilePdf,
} from "react-icons/fa";

import SaveProfileButton from "../../components/SaveProfileButton";

export default function PinkBusinessCardTheme({ profile }) {
  if (!profile) return null;

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
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.full_name}'s Digital Card`,
          text: `Check out ${profile.full_name}'s digital business card!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Profile link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-white px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* === Pink Header === */}
        <div className="relative bg-[#FDE3E6] h-48 rounded-b-[60px]">
          {/* <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[#EF5670] hover:bg-white/50 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button> */}

          <div className="absolute top-4 right-4 flex gap-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white shadow-md hover:bg-white/30 transition"
              aria-label="Share Profile"
            >
              <FaShareAlt size={18} />
            </button>
            <SaveProfileButton profileUsername={profile.username} />
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex flex-col items-center">
            <img
              src={profile.profile_pic_url || "/default-avatar.png"}
              alt={profile.full_name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
        </div>

        {/* === Profile Info === */}
        <div className="mt-16 text-center px-5">
          <h2 className="text-2xl font-bold text-gray-900">
            {profile.full_name}
          </h2>
          <p className="text-base text-gray-600">{profile.role}</p>
          <p className="text-sm text-gray-500">{profile.company}</p>
        </div>

        {/* === Contact Buttons === */}
        <div className="mt-6 px-5 space-y-4">
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number}`}
              className="flex items-center justify-between bg-white shadow-sm p-4 rounded-xl hover:bg-[#FFF7F8] transition border border-gray-100"
            >
              <div className="flex items-center gap-3 text-[#EF5670]">
                <FaPhoneAlt />
                <span className="text-pink-400">{profile.phone_number}</span>
              </div>
              {/* <span className="text-[#EF5670] font-medium">Call</span> */}
            </a>
          )}

          {profile.user_email && (
            <a
              href={`mailto:${profile.user_email}`}
              className="flex items-center justify-between bg-white shadow-sm p-4 rounded-xl hover:bg-[#FFF7F8] transition border border-gray-100"
            >
              <div className="flex items-center gap-3 text-[#EF5670]">
                <FaEnvelope />
                <span className="text-pink-400">{profile.user_email}</span>
              </div>
              {/* <span className="text-[#EF5670] font-medium">Email</span> */}
            </a>
          )}
        </div>

        {/* === Add to Contacts === */}
        <div className="flex justify-center mt-6 px-5">
          <button
            onClick={handleAddToContacts}
            className="bg-[#EF5670] text-white py-3 px-8 rounded-2xl shadow-md hover:bg-[#e3415e] transition w-3/4 font-semibold"
          >
            Add Contact
          </button>
        </div>

        {/* === About Section === */}
        {profile.about && (
          <div className="mt-8 px-6">
            <h3 className="text-lg font-semibold text-gray-900">
              About {profile.full_name?.split(" ")[0]}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {profile.about}
            </p>
          </div>
        )}

        {/* === Portfolio Section === */}
        {profile.portfolio_url && (
          <div className="mt-8 px-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Company’s Portfolio
            </h3>
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:bg-[#FFF7F8] transition"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <FaFilePdf className="text-[#EF5670]" />
                <span className="font-medium">Pitch deck.pdf</span>
              </div>
              <span className="text-gray-400">›</span>
            </a>
          </div>
        )}

        {/* === Social Links === */}
        <div className="mt-8 px-6 pb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Social Links
          </h3>
          <div className="flex justify-center flex-wrap gap-4">
            {profile.facebook_url && (
              <a
                href={profile.facebook_url}
                target="_blank"
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-[#FFF7F8] transition"
              >
                <FaFacebookF className="text-[#1877F2]" size={20} />
              </a>
            )}
            {profile.instagram_url && (
              <a
                href={profile.instagram_url}
                target="_blank"
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-[#FFF7F8] transition"
              >
                <FaInstagram className="text-[#E4405F]" size={20} />
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-[#FFF7F8] transition"
              >
                <FaLinkedinIn className="text-[#0077B5]" size={20} />
              </a>
            )}
            {profile.twitter_url && (
              <a
                href={profile.twitter_url}
                target="_blank"
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-[#FFF7F8] transition"
              >
                <FaXTwitter className="text-black" size={20} />
              </a>
            )}
            {profile.whatsapp_url && (
              <a
                href={profile.whatsapp_url}
                target="_blank"
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-[#FFF7F8] transition"
              >
                <FaWhatsapp className="text-[#25D366]" size={22} />
              </a>
            )}
          </div>
        </div>

        {/* === Footer === */}
        <div className="pb-6 text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="text-[#EF5670] font-medium">Tapinfi Solutions Pvt Ltd</span>
        </div>
      </div>
    </div>
  );
}
