// src/app/api/person-groups/route.js

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get("personId");

  if (!personId) {
    return NextResponse.json({ success: true, groups: [] });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, group_name
       FROM group_info
       WHERE person_id = ?
       ORDER BY created_at DESC`,
      [personId]
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
