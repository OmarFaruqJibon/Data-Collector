import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, persons: [] });
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         profile_name,
         profile_id,
         phone_number,
         address,
         occupation,
         age
       FROM person_info
       WHERE profile_name LIKE ?
       ORDER BY profile_name
       LIMIT 10`,
      [`%${q}%`]
    );

    return NextResponse.json({ success: true, persons: rows });
  } catch (error) {
    console.error("SEARCH PERSON ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
