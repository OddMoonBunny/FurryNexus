
import { db } from './db';
import { sql } from 'drizzle-orm';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Check if gallery_artworks table exists
    const galleryArtworksExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gallery_artworks'
      );
    `);
    
    if (!galleryArtworksExists.rows[0].exists) {
      console.log('Creating gallery_artworks table...');
      
      // First, check the data type of galleries.id column
      const galleriesIdType = await db.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'galleries' AND column_name = 'id'
      `);
      
      const idType = galleriesIdType.rows.length > 0 ? galleriesIdType.rows[0].data_type : 'uuid';
      console.log(`Galleries id type: ${idType}`);
      
      if (idType.toLowerCase() === 'uuid') {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS gallery_artworks (
            gallery_id UUID NOT NULL REFERENCES galleries(id),
            artwork_id UUID NOT NULL REFERENCES artworks(id),
            added_at TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (gallery_id, artwork_id)
          );
        `);
      } else {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS gallery_artworks (
            gallery_id INTEGER NOT NULL REFERENCES galleries(id),
            artwork_id UUID NOT NULL REFERENCES artworks(id),
            added_at TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (gallery_id, artwork_id)
          );
        `);
      }
      console.log('gallery_artworks table created successfully');
    } else {
      console.log('gallery_artworks table already exists');
    }

    // Check if comments table exists
    const commentsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'comments'
      );
    `);
    
    if (!commentsExists.rows[0].exists) {
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
