import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT group_name, group_id FROM group_info ORDER BY group_name`
    );

    return NextResponse.json({ success: true, groups: rows });
  } catch (error) {
    console.error("FETCH GROUPS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
