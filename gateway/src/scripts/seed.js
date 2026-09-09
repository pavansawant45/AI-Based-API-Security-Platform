/**
 * ============================================================
 * Database Seed Script
 * ============================================================
 * Populates MongoDB with initial test data:
 *   - A test API key (for x-api-key authentication)
 *   - An admin API key (for admin-role testing)
 *   - A sample blacklist entry (for IP filter testing)
 *   - A sample whitelist entry (for rate limit bypass testing)
 *
 * Usage:
 *   node src/scripts/seed.js
 *   (or: docker-compose exec gateway npm run seed)
 *
 * IMPORTANT: This script is idempotent — it uses upsert
 * operations, so running it multiple times is safe.
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/index');
const ApiKey = require('../models/ApiKey');
const BlacklistEntry = require('../models/BlacklistEntry');
const WhitelistEntry = require('../models/WhitelistEntry');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongo.uri, {
      dbName: config.mongo.dbName,
    });
    console.log('✅ Connected to MongoDB\n');

    // ── Seed API Keys ──
    const apiKeys = [
      {
        key: process.env.TEST_API_KEY || 'test-api-key-001',
        name: 'Test User Key',
        role: 'user',
        active: true,
      },
      {
        key: 'admin-api-key-001',
        name: 'Test Admin Key',
        role: 'admin',
        active: true,
      },
    ];

    for (const keyData of apiKeys) {
      await ApiKey.findOneAndUpdate(
        { key: keyData.key },
        keyData,
        { upsert: true, new: true }
      );
      console.log(`  🔑 API Key: "${keyData.name}" (${keyData.role}) → ${keyData.key}`);
    }

    // ── Seed Blacklist ──
    const blacklistEntries = [
      {
        ip: '192.168.100.100',
        reason: 'Test blacklisted IP — for testing IP filter middleware',
      },
    ];

    for (const entry of blacklistEntries) {
      await BlacklistEntry.findOneAndUpdate(
        { ip: entry.ip },
        entry,
        { upsert: true, new: true }
      );
      console.log(`  🚫 Blacklisted IP: ${entry.ip} (${entry.reason})`);
    }

    // ── Seed Whitelist ──
    const whitelistEntries = [
      {
        ip: '127.0.0.1',
        reason: 'Localhost — bypasses rate limiting for local development',
      },
    ];

    for (const entry of whitelistEntries) {
      await WhitelistEntry.findOneAndUpdate(
        { ip: entry.ip },
        entry,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Whitelisted IP: ${entry.ip} (${entry.reason})`);
    }

    console.log('\n🌱 Database seed completed successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('📦 MongoDB disconnected.');
    process.exit(0);
  }
}

seed();
