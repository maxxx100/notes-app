import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(connectionString);

const seeds: [string, string, string][] = [
  [
    'Welcome to Marfa',
    'A small, strange town in West Texas. Known for the Marfa Lights, Prada Marfa, and the Chinati Foundation.',
    'sand',
  ],
  [
    'Desert Reading List',
    'Blood Meridian — Cormac McCarthy\nThe Teachings of Don Juan — Carlos Castaneda\nCadillac Desert — Marc Reisner',
    'rust',
  ],
  [
    'Things to do at dusk',
    "Drive out to the viewing station on 90. Bring a blanket. Don't bring your phone.",
    'sage',
  ],
];

async function migrate() {
  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id        SERIAL PRIMARY KEY,
      title     TEXT NOT NULL DEFAULT '',
      body      TEXT NOT NULL DEFAULT '',
      color     TEXT NOT NULL DEFAULT 'sand',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM notes`;
  if (count === 0) {
    console.log('Seeding...');
    for (const [title, body, color] of seeds) {
      await sql`INSERT INTO notes (title, body, color) VALUES (${title}, ${body}, ${color})`;
    }
    console.log(`Inserted ${seeds.length} seed notes.`);
  } else {
    console.log(`Table already has ${count} row(s), skipping seed.`);
  }

  console.log('Done.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
