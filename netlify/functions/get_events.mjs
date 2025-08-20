import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows = await sql`SELECT id, title, description, date, event_time, location, image_name, tag, see_more FROM events ORDER BY date ASC;`;

    return {
      statusCode: 200,
      body: JSON.stringify({ data: rows }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
