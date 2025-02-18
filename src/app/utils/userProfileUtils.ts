interface User {
  id: string;
  email: string;
}

interface FetchError {
  message: string;
}

export async function fetchUserProfile(token: string | null): Promise<User> {
  try {
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile.");
    }

    const userData: User = await response.json();
    return userData;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user profile:", error.message);
      throw error as FetchError; // Rethrow the error with typing
    }
    throw new Error("Unknown error occurred during fetch");
  }
}
