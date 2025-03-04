import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1] || "";

  try {
    // Call your backend profile endpoint (adjust URL if needed)
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: backendRes.status }
      );
    }

    const userProfile = await backendRes.json();
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("Error while fetching user profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user profile" },
      { status: 500 }
    );
  }
}
