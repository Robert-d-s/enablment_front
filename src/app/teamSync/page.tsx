import React, { useEffect } from "react";

const TeamSyncAndFetch: React.FC = () => {
  // const [teams, setTeams] = useState<Team[]>([]);

  const syncTeams = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/team-synchronize/teams`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();
      console.log("Sync Response:", data);
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  useEffect(() => {
    const fetchDataAndSync = async () => {
      await syncTeams();
      // await fetchTeams();
    };

    fetchDataAndSync();
  }, []);

  return (
    <button
      onClick={syncTeams}
      className="p-2 bg-black text-white rounded-full hover:bg-blue-600 flex flex-col items-center justify-center relative"
      style={{ width: "120px", height: "120px" }}
    >
      <div
        className="absolute w-full flex flex-col items-center justify-center"
        style={{ top: "46%", transform: "translateY(-50%)" }}
      >
        <span className="text-center text-xs">Sync</span>
        <span className="text-center text-xs mt-1">Teams</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M16 15L24 15 20 20zM8 9L0 9 4 4z"></path>
        <path d="M21 6c0-1.654-1.346-3-3-3H7.161l1.6 2H18c.551 0 1 .448 1 1v10h2V6zM3 18c0 1.654 1.346 3 3 3h10.839l-1.6-2H6c-.551 0-1-.448-1-1V8H3V18z"></path>
      </svg>
    </button>
  );
};

export default TeamSyncAndFetch;
