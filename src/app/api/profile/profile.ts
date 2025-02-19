import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log("NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
  const token = req.headers.authorization?.split(" ")[1] || ""; // Extract JWT token from incoming header

  try {
    // Assuming the endpoint to fetch user profile is at /auth/profile
    const backendResponse = await fetch(`http://localhost:8080/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      throw new Error("Failed to fetch user profile.");
    }

    const userProfile = await backendResponse.json();
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error while fetching user profile:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user profile" });
  }
}
