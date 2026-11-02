import { NextRequest, NextResponse } from "next/server";

/**
 * API route khusus untuk menyimpan token Google OAuth sebagai httpOnly cookie.
 * Cookie httpOnly tidak bisa dibaca JavaScript dan lebih aman dari XSS.
 * Dipanggil dari Google callback page setelah menerima token dari backend.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "accessToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error) {
    console.error("[SET-TOKEN] Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan token" },
      { status: 500 },
    );
  }
}
