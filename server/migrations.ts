import { db } from './db';
import { sql } from 'drizzle-orm';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Check if collections table exists
    const collectionsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'collections'
      );
    `);

    if (!collectionsExists.rows[0].exists) {
      console.log('Creating collections table...');

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collections (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_featured BOOLEAN NOT NULL DEFAULT false
        );
      `);
      console.log('Collections table created successfully');
    } else {
      console.log('Collections table already exists');
    }

    // Check if collection_artworks table exists
    const collectionArtworksExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'collection_artworks'
      );
    `);

    if (!collectionArtworksExists.rows[0].exists) {
      console.log('Creating collection_artworks table...');

      // Get the data type of artworks.id to ensure compatibility
      const artworksIdType = await db.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'id'
      `);

      const artworkIdType = artworksIdType.rows.length > 0 ? artworksIdType.rows[0].data_type : 'uuid';
      console.log(`Artworks id type: ${artworkIdType}`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collection_artworks (
          collection_id INTEGER NOT NULL REFERENCES collections(id),
          artwork_id ${sql.raw(artworkIdType.toLowerCase() === 'uuid' ? 'UUID' : 'INTEGER')} NOT NULL REFERENCES artworks(id),
          added_at TIMESTAMP NOT NULL DEFAULT NOW(),
          PRIMARY KEY (collection_id, artwork_id)
        );
      `);
      console.log('collection_artworks table created successfully');
    } else {
      console.log('collection_artworks table already exists');
    }

    // Add featured column to artworks if it doesn't exist
    const featuredColumnExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'artworks' AND column_name = 'is_featured'
      );
    `);

    if (!featuredColumnExists.rows[0].exists) {
      console.log('Adding is_featured column to artworks table...');
      await db.execute(sql`
        ALTER TABLE artworks
        ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
      `);
      console.log('Added is_featured column to artworks table');
    }


    // Check if gallery_artworks table exists
    const galleryArtworksExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gallery_artworks'
      );
    `);
    
    if (!galleryArtworksExists.rows[0].exists) {
      console.log('Creating gallery_artworks table...');
      
      // Check the data types of both galleries.id and artworks.id columns
      const galleriesIdType = await db.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'galleries' AND column_name = 'id'
      `);
      
      const artworksIdType = await db.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'id'
      `);
      
      const galleryIdType = galleriesIdType.rows.length > 0 ? galleriesIdType.rows[0].data_type : 'uuid';
      const artworkIdType = artworksIdType.rows.length > 0 ? artworksIdType.rows[0].data_type : 'uuid';
      
      console.log(`Galleries id type: ${galleryIdType}`);
      console.log(`Artworks id type: ${artworkIdType}`);
      
      // Create table with proper data types
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS gallery_artworks (
          gallery_id ${sql.raw(galleryIdType.toLowerCase() === 'uuid' ? 'UUID' : 'INTEGER')} NOT NULL REFERENCES galleries(id),
          artwork_id ${sql.raw(artworkIdType.toLowerCase() === 'uuid' ? 'UUID' : 'INTEGER')} NOT NULL REFERENCES artworks(id),
          added_at TIMESTAMP NOT NULL DEFAULT NOW(),
          PRIMARY KEY (gallery_id, artwork_id)
        );
      `);
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
      
      // Get the data type of artworks.id to ensure compatibility
      const artworksIdType = await db.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'id'
      `);
      
      const artworkIdType = artworksIdType.rows.length > 0 ? artworksIdType.rows[0].data_type : 'uuid';
      console.log(`Artworks id type: ${artworkIdType}`);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          artwork_id ${sql.raw(artworkIdType.toLowerCase() === 'uuid' ? 'UUID' : 'INTEGER')} NOT NULL REFERENCES artworks(id),
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