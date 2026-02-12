import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET() {
  try {
    const id = process.env.SPOTS_DB_ID as string;

    // intenta como database
    const db = await notion.databases.retrieve({ database_id: id });
    return NextResponse.json({ ok: true, type: "database", title: db.title });
  } catch (e1: any) {
    try {
      const id = process.env.SPOTS_DB_ID as string;

      // intenta como data source
      const ds = await notion.dataSources.retrieve({ data_source_id: id });
      return NextResponse.json({ ok: true, type: "data_source", ds });
    } catch (e2: any) {
      return NextResponse.json(
        { ok: false, error1: e1?.message, error2: e2?.message },
        { status: 500 }
      );
    }
  }
}