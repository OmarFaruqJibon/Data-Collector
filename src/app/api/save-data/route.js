// src/app/api/save-data/route.js

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  let connection;

  try {
    const body = await req.json();
    const { person, group, post } = body;

    if (!person?.profileId || !group?.groupName || !post?.postDetails) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------- PERSON ---------- */
    const [existingPerson] = await connection.execute(
      `SELECT id FROM person_info WHERE profile_id = ?`,
      [person.profileId]
    );

    let personId;
    if (existingPerson.length) {
      personId = existingPerson[0].id;
    } else {
      const [insertPerson] = await connection.execute(
        `INSERT INTO person_info
         (profile_name, profile_id, phone_number, address, occupation, age)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          person.profileName,
          person.profileId,
          person.phoneNumber || null,
          person.address || null,
          person.occupation || null,
          person.age ? Number(person.age) : null,
        ]
      );
      personId = insertPerson.insertId;
    }

    /* ---------- GROUP (belongs to person) ---------- */
    let groupDbId;

    if (group.id) {
      const [existingGroup] = await connection.execute(
        `SELECT id FROM group_info WHERE id = ? AND person_id = ?`,
        [group.id, personId]
      );

      if (!existingGroup.length) {
        throw new Error("Invalid group selection");
      }

      groupDbId = existingGroup[0].id;
    } else {
      const [insertGroup] = await connection.execute(
        `INSERT INTO group_info (group_name, note, person_id)
     VALUES (?, ?, ?)`,
        [group.groupName, group.note || null, personId]
      );

      groupDbId = insertGroup.insertId;
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("SAVE DATA ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
