import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

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
    await supabase.from("users").update({ publish: !currentValue }).eq("id", id);
    fetchUsers();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  // Filter users by search input
  const filteredUsers = users.filter(
    (user) =>
      user.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-600 mx-auto">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email or username..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto shadow-md rounded-xl bg-white">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 uppercase text-gray-600">
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone Number</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Published</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
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

            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
