import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import imageCompression from "browser-image-compression";

export default function AddThemeForm({ onThemeAdded }) {
  const [themeId, setThemeId] = useState("");
  const [themeName, setThemeName] = useState("");
  const [themeImage, setThemeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Validate image type & size before setting
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setThemeImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    } else {
      setThemeImage(null);
      setImagePreview(null);
    }
  };

  const handleAddTheme = async () => {
    setError("");
    if (!themeId.trim() || !themeName.trim() || !themeImage) {
      setError("Please fill all fields and upload an image");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Compress image
      const compressed = await imageCompression(themeImage, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const timestamp = Date.now();
      const filePath = `themes/theme_${themeId.trim()}_${timestamp}.webp`;

      // 2️⃣ Upload to dedicated bucket
      const { error: uploadError } = await supabase.storage
        .from("theme_images") // updated bucket
        .upload(filePath, compressed, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);

      // 3️⃣ Get public URL
      const { data } = supabase.storage.from("theme_images").getPublicUrl(filePath);
      const imageUrl = data.publicUrl;

      // 4️⃣ Insert theme into table
      const { error: insertError } = await supabase.from("available_themes").insert([
        { id: themeId.trim(), name: themeName.trim(), image_url: imageUrl },
      ]);

      if (insertError) throw new Error("Failed to add theme: " + insertError.message);

      // 5️⃣ Reset form & notify parent
      setThemeId("");
      setThemeName("");
      setThemeImage(null);
      setImagePreview(null);
      onThemeAdded();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white shadow rounded-md flex flex-col gap-3">
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Theme ID"
        value={themeId}
        onChange={(e) => setThemeId(e.target.value)}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="Theme Name"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Theme Preview"
          className="w-32 h-32 object-cover rounded border mt-2"
        />
      )}

      <button
        onClick={handleAddTheme}
        disabled={loading}
        className={`px-3 py-2 rounded-md text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Adding..." : "Add Theme"}
      </button>
    </div>
  );
}
