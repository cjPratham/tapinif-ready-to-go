export default function UnpublishedProfile() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-100 p-4 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-12 flex flex-col items-center space-y-6 animate-pulse">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
        <div className="w-48 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-32 h-4 bg-gray-300 rounded-full"></div>
        <div className="w-64 h-4 bg-gray-300 rounded-full"></div>
        <div className="w-56 h-4 bg-gray-300 rounded-full"></div>
      </div>

      <p className="mt-8 text-lg text-gray-600 font-medium animate-pulse">
        This profile is not published yet. Stay tuned!
      </p>
    </div>
  );
}
