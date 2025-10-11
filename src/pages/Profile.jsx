import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

/* ----------------------------
  Reusable Input Components
---------------------------- */
const ProfileInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly = false,
  required = false,
  error,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full p-3 border rounded-lg transition duration-150 ease-in-out ${
        readOnly
          ? "bg-gray-50 border-gray-300"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
      } ${error ? "border-red-500" : ""}`}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ProfileTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  error,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      placeholder={placeholder}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out ${
        error ? "border-red-500" : ""
      }`}
      rows={rows}
      value={value}
      onChange={onChange}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  /* ----------------------------
     1. Fetch user & profile
  ---------------------------- */
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

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!userData) {
        await supabase
          .from("users")
          .upsert({ id: user.id, user_email: user.email });
        setProfile({ user_email: user.email });
      } else {
        setProfile({ ...userData, user_email: user.email });
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  /* ----------------------------
     2. Image Upload Handlers
  ---------------------------- */
  const handleImageUpload = async (e, type = "profile") => {
    const file = e.target.files[0];
    if (!file || !user) return;
    if (!profile.username) {
      alert("Please set your username before uploading images.");
      return;
    }

    try {
      const options = {
        maxSizeMB: type === "cover" ? 1 : 0.5,
        maxWidthOrHeight: type === "cover" ? 1600 : 800,
        useWebWorker: true,
        fileType: "image/webp",
      };
      const compressed = await imageCompression(file, options);
      const timestamp = Date.now();
      const filePath = `${type}_${user.id}_${timestamp}.webp`;

      const columnKey = type === "cover" ? "cover_pic_url" : "profile_pic_url";
      const oldUrl = profile[columnKey];
      if (oldUrl) {
        const oldFile = oldUrl.split("/").pop().split("?")[0];
        await supabase.storage.from("profile_pics").remove([oldFile]);
      }

      const { error: uploadError } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, compressed);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(filePath);
      const imageUrl = `${data.publicUrl}?t=${timestamp}`;

      const { error: dbError } = await supabase
        .from("users")
        .upsert({ id: user.id, [columnKey]: imageUrl, username: profile.username });
      if (dbError) throw dbError;

      setProfile((prev) => ({ ...prev, [columnKey]: imageUrl }));
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    }
  };

  /* ----------------------------
     3. Validation before saving
  ---------------------------- */
  const validateFields = () => {
    const newErrors = {};

    if (!profile.username) newErrors.username = "Username is required.";
    if (/\s/.test(profile.username || ""))
      newErrors.username = "Username cannot contain spaces.";
    if (!profile.full_name) newErrors.full_name = "Full name is required.";
    if (!profile.company) newErrors.company = "Company name is required.";
    if (!profile.role) newErrors.role = "Role / title is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ----------------------------
     4. Save Profile
  ---------------------------- */
  const handleSave = async () => {
    if (!user || isSaving) return;
    if (!validateFields()) return;

    setIsSaving(true);
    try {
      const { username } = profile;
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUser) {
        alert("This username is already taken.");
        setIsSaving(false);
        return;
      }

      const updatedProfile = {
        id: user.id,
        user_email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        company: profile.company,
        about: profile.about,
        phone_number: profile.phone_number,
        website_url: profile.website_url,
        portfolio_url: profile.portfolio_url,
        facebook_url: profile.facebook_url,
        instagram_url: profile.instagram_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        whatsapp_url: profile.whatsapp_url,
        username,
      };

      const { error } = await supabase.from("users").upsert(updatedProfile);
      if (error) throw error;

      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-xl font-semibold text-blue-600">
        Loading profile...
      </p>
    );

  /* ----------------------------
     5. UI Layout
  ---------------------------- */
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-6 border-b pb-2">
          Edit Your Business Profile
        </h1>

        {/* COVER IMAGE */}
        <div className="relative w-full h-48 mb-6 bg-gray-200 rounded-lg overflow-hidden">
          {profile.cover_pic_url ? (
            <img
              src={profile.cover_pic_url}
              alt="Cover"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No cover photo
            </div>
          )}
          <label className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded shadow cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700">
            Change Cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </label>
        </div>

        {/* PROFILE PHOTO */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={
              profile.profile_pic_url ||
              "https://via.placeholder.com/100/3B82F6/FFFFFF?text=P"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md mb-3"
          />
          <label className="text-base font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
            Change Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "profile")}
            />
          </label>
        </div>

        {/* BASIC INFO */}
        <div className="mb-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Details
          </h2>
          <ProfileInput
            label="Username"
            placeholder="unique_id"
            value={profile.username || ""}
            onChange={(e) =>
              !profile.username &&
              setProfile((prev) => ({
                ...prev,
                username: e.target.value.replace(/\s+/g, ""),
              }))
            }
            readOnly={!!profile.username}
            required
            error={errors.username}
          />
          {profile.username && (
            <p className="text-green-600 text-xs mb-4 -mt-2">
              ✅ Username locked — cannot be changed.
            </p>
          )}
          <ProfileInput
            label="Full Name"
            placeholder="Aman Gupta"
            value={profile.full_name || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, full_name: e.target.value }))
            }
            required
            error={errors.full_name}
          />
          <ProfileInput
            label="Company Name"
            placeholder="Tapinfi Technologies"
            value={profile.company || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, company: e.target.value }))
            }
            required
            error={errors.company}
          />
          <ProfileInput
            label="Role / Title"
            placeholder="Founder / CEO"
            value={profile.role || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, role: e.target.value }))
            }
            required
            error={errors.role}
          />
          <ProfileTextarea
            label="About You"
            placeholder="Brief about your work, business or vision..."
            value={profile.about || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, about: e.target.value }))
            }
          />
        </div>

        {/* CONTACT + SOCIAL */}
        <div className="mb-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contact & Social Links
          </h2>
          <ProfileInput
            label="Email"
            value={profile.user_email || ""}
            readOnly
          />
          <ProfileInput
            label="Phone Number"
            placeholder="+91 9876543210"
            value={profile.phone_number || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, phone_number: e.target.value }))
            }
          />
          <ProfileInput
            label="Website"
            placeholder="https://yourcompany.com"
            value={profile.website_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, website_url: e.target.value }))
            }
          />
          <ProfileInput
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/yourname"
            value={profile.linkedin_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, linkedin_url: e.target.value }))
            }
          />
          <ProfileInput
            label="Instagram URL"
            placeholder="https://instagram.com/yourhandle"
            value={profile.instagram_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, instagram_url: e.target.value }))
            }
          />
          <ProfileInput
            label="Twitter/X URL"
            placeholder="https://twitter.com/yourhandle"
            value={profile.twitter_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, twitter_url: e.target.value }))
            }
          />
          <ProfileInput
            label="Facebook URL"
            placeholder="https://facebook.com/yourpage"
            value={profile.facebook_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, facebook_url: e.target.value }))
            }
          />
          <ProfileInput
            label="WhatsApp Link"
            placeholder="https://wa.me/919876543210"
            value={profile.whatsapp_url || ""}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, whatsapp_url: e.target.value }))
            }
          />
        </div>

        {/* ACTION BUTTONS */}
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
