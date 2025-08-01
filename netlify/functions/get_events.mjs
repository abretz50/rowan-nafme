import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows = await sql`SELECT * FROM events ORDER BY date ASC;`;

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
