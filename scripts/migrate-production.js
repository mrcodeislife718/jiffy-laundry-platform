#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigrations() {
  const client = new Client({
    host: 'db.rkcqkppbxakimquqfemx.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'R!Y2$X2QWpmwTF?',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Connecting to Supabase production database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read migration files
    const migration1Path = path.join(__dirname, '../supabase/migrations/001_create_initial_schema.sql');
    const migration2Path = path.join(__dirname, '../supabase/migrations/20260503193520_create_initial_schema.sql');

    if (!fs.existsSync(migration1Path)) {
      throw new Error(`Migration file not found: ${migration1Path}`);
    }

    if (!fs.existsSync(migration2Path)) {
      throw new Error(`Migration file not found: ${migration2Path}`);
    }

    // Execute migrations
    console.log('🔄 Running migration 1: 001_create_initial_schema.sql...');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
    await client.query(migration1SQL);
    console.log('✅ Migration 1 completed\n');

    console.log('🔄 Running migration 2: 20260503193520_create_initial_schema.sql...');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
    await client.query(migration2SQL);
    console.log('✅ Migration 2 completed\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('✅ Tables created in production database:');
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    console.log('\n✅ PHASE A COMPLETE: Supabase production database migrated successfully!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
