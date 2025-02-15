const UserSelector: React.FC<{
  users: { id: string; email: string }[];
  selectedUser: string;
  onUserChange: (userId: string) => void;
}> = ({ users, selectedUser, onUserChange }) => {
  return (
    <select
      value={selectedUser}
      onChange={(e) => onUserChange(e.target.value)}
      className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="" disabled>
        Select a user
      </option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.email}
        </option>
      ))}
    </select>
  );
};
export default UserSelector;
