// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data);
    setLoading(false);
  }

  async function togglePublish(id, currentValue) {
    await supabase
      .from("users")
      .update({ publish: !currentValue })
      .eq("id", id);
    fetchUsers();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-blue-600 mx-auto">
        Admin Dashboard
      </h1>
      {/* <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Logout
      </button> */}
    </div>

    {/* Search */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search by email or username..."
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-3">Email</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Username</th>
              <th className="p-3">Published</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.user_email}</td>
                <td className="p-3">{user.phone_number}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">
                  {user.publish ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Unpublished
                    </span>
                  )}
                </td>
                <td className="p-3 flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(user.id, user.publish)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
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
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition"
                      title="View Profile"
                    >
                      <FaEye />
                    </a>
                  )}
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
