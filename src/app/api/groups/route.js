// src/app/api/groups/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT id, group_name, person_id
       FROM group_info
       ORDER BY group_name`
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { personId, groupName, note } = body;

    if (!personId || !groupName) {
      return NextResponse.json(
        { success: false, error: "personId and groupName are required" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `
      INSERT INTO group_info (group_name, note, person_id)
      VALUES (?, ?, ?)
      `,
      [groupName, note || null, personId]
    );

    return NextResponse.json({
      success: true,
      group: {
        id: result.insertId,
        group_name: groupName,
        person_id: personId
      }
    });
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

