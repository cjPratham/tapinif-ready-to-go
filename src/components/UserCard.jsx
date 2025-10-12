import { useState, useRef, useEffect } from "react";
import { FaEye, FaChevronDown } from "react-icons/fa";

export default function UserCard({
  user,
  userThemes,
  availableThemes,
  toggleTheme, // now used to assign/remove
  togglePublish,
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  const isAssigned = (themeId) => userThemes?.some((t) => t.theme_id === themeId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white w-full rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6 flex flex-col gap-4">
      {/* USER INFO */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800 truncate">
            {user.username || "Unnamed User"}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{user.user_email}</p>
          {user.phone_number && (
            <p className="text-xs text-gray-400">{user.phone_number}</p>
          )}
        </div>

        {/* STATUS + THEMES DROPDOWN */}
        <div className="flex flex-col items-end gap-2 sm:w-[160px]" ref={dropdownRef}>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full self-end ${
              user.publish
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.publish ? "Published" : "Unpublished"}
          </span>

          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm"
          >
            Manage Themes
            <FaChevronDown
              className={`transition-transform ${openDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown && (
            <div className="absolute mt-2 w-[220px] bg-white shadow-xl rounded-lg border border-gray-100 max-h-60 overflow-y-auto z-20 right-0 animate-fadeIn">
              {availableThemes.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-3">
                  No themes available
                </p>
              ) : (
                availableThemes.map((theme) => {
                  const assigned = isAssigned(theme.id);
                  return (
                    <div
                      key={theme.id}
                      className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 rounded-md transition-all"
                    >
                      <span className="text-sm text-gray-700 font-medium">{theme.name}</span>
                      <button
                        onClick={() => toggleTheme(user.id, theme.id)}
                        className={`px-2 py-1 text-xs rounded-md ${
                          assigned
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        } transition`}
                      >
                        {assigned ? "Remove" : "Assign"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap justify-between gap-3">
        <button
          onClick={() => togglePublish(user.id, user.publish)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm text-center ${
            user.publish
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {user.publish ? "Unpublish" : "Publish"}
        </button>

        {user.username && (
          <a
            href={`/profile/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <FaEye size={13} />
            View Profile
          </a>
        )}
      </div>
    </div>
  );
}
