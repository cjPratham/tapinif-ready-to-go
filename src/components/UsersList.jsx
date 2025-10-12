import UserCard from "./UserCard";

export default function UsersList({
  users,
  userThemes,
  availableThemes,
  toggleTheme,
  togglePublish,
}) {
  if (!users?.length)
    return (
      <p className="text-center text-gray-500 mt-10">
        No users found yet.
      </p>
    );

  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-5 md:px-10 lg:px-16 xl:px-24">
      {users.map((user) => (
        <div
          key={user.id}
          className="w-full flex justify-center"
        >
          <div className="w-full max-w-[600px]">
            <UserCard
              user={user}
              userThemes={userThemes[user.id]}
              availableThemes={availableThemes}
              toggleTheme={toggleTheme}
              togglePublish={togglePublish}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
