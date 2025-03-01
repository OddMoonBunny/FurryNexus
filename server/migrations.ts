
import { db } from './db';
import { sql } from 'drizzle-orm';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Check if comments table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'comments'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating comments table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          artwork_id UUID NOT NULL REFERENCES artworks(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('Comments table created successfully');
    } else {
      console.log('Comments table already exists');
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

export { runMigrations };
