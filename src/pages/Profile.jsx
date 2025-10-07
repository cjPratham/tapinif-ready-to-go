import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

// Helper component for consistent input styling
const ProfileInput = ({ label, placeholder, value, onChange, type = "text", readOnly = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full p-3 border ${readOnly ? 'bg-gray-50 border-gray-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-lg transition duration-150 ease-in-out`}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  </div>
);

// Helper component for consistent textarea styling
const ProfileTextarea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out"
      rows={rows}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // ----------------------------
  // 1. Fetch user & profile data
  // ----------------------------
useEffect(() => {
  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      navigate("/");
      return;
    }
    setUser(user);

    // Fetch profile record
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData) {
      // No record exists yet → create one with email
      const { error: insertError } = await supabase
        .from("users")
        .upsert({ id: user.id, user_email: user.email });

      if (insertError) {
        console.error("Failed to create user record:", insertError.message);
      }

      setProfile({ user_email: user.email });
    } else {
      // Record exists → merge with auth email
      setProfile({ ...userData, user_email: user.email });
    }

    setLoading(false);
  };

  fetchUser();
}, [navigate]);



  // ----------------------------
  // 2. Handle image upload (unchanged)
  // ----------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // CHECK 1: Ensure username is not null before proceeding
    if (!profile.username) {
        alert("Error: Please set your username before uploading a profile picture.");
        return;
    }

    try {
      // 1. Compress & convert
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
      };
      const compressedFile = await imageCompression(file, options);

      // 2. Prepare file paths
      const timestamp = Date.now();
      const filePath = `user_${user.id}_${timestamp}.webp`;

      // 3. Delete old image if exists
      if (profile.profile_pic_url) {
        const oldFilePath = profile.profile_pic_url.split("/").pop().split("?")[0]; 
        await supabase.storage.from("profile_pics").remove([oldFilePath]);
      }

      // 4. Upload new image
      const { error: uploadError } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // 5. Get public URL with cache-busting
      const { data } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(filePath);

      const imageUrl = `${data.publicUrl}?t=${timestamp}`;

      // 6. Save URL in DB
      const { error: dbError } = await supabase
          .from("users")
          .upsert({ 
              id: user.id, 
              profile_pic_url: imageUrl,
              username: profile.username // <-- FIX: Include the current username
          });

      if (dbError) throw dbError;

      // 7. Update state to preview
      setProfile((prev) => ({ ...prev, profile_pic_url: imageUrl }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile image: " + err.message);
    }
  };

  // ----------------------------
  // 3. Handle profile update
  // ----------------------------
  const handleSave = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    
    // VALIDATION: Check for the missing username
    if (!profile.username) {
        alert("❌ Error: Username is required and cannot be empty.");
        setIsSaving(false);
        return;
    }

    // Destructure all editable fields including the new 'username'
    const { 
        full_name, role, company, about, 
        phone_number, website_url, portfolio_url,
        facebook_url, instagram_url, linkedin_url, twitter_url, whatsapp_url,
        username
    } = profile;

    const { error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        user_email: user.email, // keep email in sync
        full_name,
        role,
        company,
        about,
        phone_number,
        website_url,
        portfolio_url,
        facebook_url,
        instagram_url,
        linkedin_url,
        twitter_url,
        whatsapp_url,
        username, // <-- ADDED USERNAME HERE
      });

    setIsSaving(false);
    if (error) alert("❌ Profile update failed: " + error.message);
    else alert("✅ Profile successfully updated!");
  };

  // ----------------------------
  // 4. Logout (unchanged)
  // ----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <p className="text-center mt-10 text-xl font-semibold text-blue-600">Loading profile data...</p>;

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 sm:p-8">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Edit Business Profile</h1>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={
              profile.profile_pic_url ||
              "https://via.placeholder.com/100/3B82F6/FFFFFF?text=P"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md mb-3"
          />
          <label className="text-base font-semibold text-blue-600 cursor-pointer hover:text-blue-700 transition duration-150">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* ----------------------------
           Primary Information Section
        ---------------------------- */}
        <div className="mb-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Details</h2>
            
            <ProfileInput
                label="Username (Required)"
                placeholder="unique_username_123"
                value={profile.username || ""}
                onChange={(e) => handleProfileChange("username", e.target.value)}
            />
            <p className="text-sm text-red-600 mb-4 -mt-2">
                This field is required and must be unique.
            </p>

            <ProfileInput
                label="Full Name"
                placeholder="Aman Gupta"
                value={profile.full_name || ""}
                onChange={(e) => handleProfileChange("full_name", e.target.value)}
            />
            <ProfileInput
                label="Role / Title"
                placeholder="Director / CEO"
                value={profile.role || ""}
                onChange={(e) => handleProfileChange("role", e.target.value)}
            />
            <ProfileInput
                label="Company Name"
                placeholder="ABC Company"
                value={profile.company || ""}
                onChange={(e) => handleProfileChange("company", e.target.value)}
            />
            <ProfileTextarea
                label="About You"
                placeholder="A brief description about yourself or your business..."
                rows={4}
                value={profile.about || ""}
                onChange={(e) => handleProfileChange("about", e.target.value)}
            />
        </div>

        {/* ----------------------------
           Contact & Links Section
        ---------------------------- */}
        <div className="mb-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact & Links</h2>

            {/* Read-only Email Field */}
            <ProfileInput
                label="Email (Read Only)"
                placeholder="user@example.com"
                value={profile.user_email || ""}
                readOnly={true}
            />
            <p className="text-sm text-yellow-600 mb-4 -mt-2">
                Note: To change your email, you must use the Supabase Auth update function which requires re-verification.
            </p>

            <ProfileInput
                label="Phone Number"
                placeholder="+1 555 123 4567"
                value={profile.phone_number || ""}
                onChange={(e) => handleProfileChange("phone_number", e.target.value)}
            />
            <ProfileInput
                label="Website URL"
                placeholder="https://www.yourcompany.com"
                value={profile.website_url || ""}
                onChange={(e) => handleProfileChange("website_url", e.target.value)}
            />
            <ProfileInput
                label="Portfolio/Pitch Deck URL"
                placeholder="https://drive.google.com/pitchdeck.pdf"
                value={profile.portfolio_url || ""}
                onChange={(e) => handleProfileChange("portfolio_url", e.target.value)}
            />
        </div>

        {/* ----------------------------
           Social Media Section
        ---------------------------- */}
        <div className="mb-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media</h2>
            <ProfileInput
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourname"
                value={profile.linkedin_url || ""}
                onChange={(e) => handleProfileChange("linkedin_url", e.target.value)}
            />
            <ProfileInput
                label="Instagram URL"
                placeholder="https://instagram.com/yourhandle"
                value={profile.instagram_url || ""}
                onChange={(e) => handleProfileChange("instagram_url", e.target.value)}
            />
            <ProfileInput
                label="Twitter/X URL"
                placeholder="https://twitter.com/yourhandle"
                value={profile.twitter_url || ""}
                onChange={(e) => handleProfileChange("twitter_url", e.target.value)}
            />
            <ProfileInput
                label="Facebook URL"
                placeholder="https://facebook.com/yourpage"
                value={profile.facebook_url || ""}
                onChange={(e) => handleProfileChange("facebook_url", e.target.value)}
            />
            <ProfileInput
                label="WhatsApp Link/Number"
                placeholder="https://wa.me/1234567890 (Recommended)"
                value={profile.whatsapp_url || ""}
                onChange={(e) => handleProfileChange("whatsapp_url", e.target.value)}
            />
        </div>

        {/* ----------------------------
           Action Buttons
        ---------------------------- */}
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-3 rounded-lg text-lg font-bold transition duration-200 ${
              isSaving
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition duration-200"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}