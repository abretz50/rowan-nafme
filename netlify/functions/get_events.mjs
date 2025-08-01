import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const meta = await sql`SELECT current_database() AS db, current_user AS user`;
    console.log("Connected to:", meta);

    const rows = await sql`SELECT * FROM events ORDER BY date ASC`;
    return {
      statusCode: 200,
      body: JSON.stringify({ connected: meta, data: rows }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

