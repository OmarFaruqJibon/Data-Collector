import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");
    const groupId = searchParams.get("groupId");

    console.log("GET POSTS:", personId, groupId);

    if (!personId || !groupId) {
      return NextResponse.json(
        { success: false, error: "Missing personId or groupId" },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      `
      SELECT id, post_details, comments, created_at
      FROM post_info
      WHERE person_id = ? AND group_id = ?
      ORDER BY created_at DESC
      `,
      [personId, groupId]
    );

    return NextResponse.json({
      success: true,
      posts: rows
    });
  } catch (err) {
    console.error("GET /posts error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const { personId, groupId, postDetails, comments } = body;

    if (!personId || !groupId || !postDetails) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `
      INSERT INTO post_info (person_id, group_id, post_details, comments)
      VALUES (?, ?, ?, ?)
      `,
      [personId, groupId, postDetails, comments || null]
    );

    // Fetch inserted post
    const [rows] = await db.execute(
      `SELECT * FROM post_info WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      post: rows[0],
    });
  } catch (err) {
    console.error("POST /posts error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
