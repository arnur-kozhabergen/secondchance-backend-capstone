require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('../../models/db');
const { closeDatabase } = connectToDatabase;

const filename = path.join(__dirname, 'secondChanceItems.json');
const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;

async function loadData(db) {
  const collection = db.collection('secondChanceItems');
  const existingCount = await collection.countDocuments();
  if (existingCount > 0) {
    console.log('Items already exist in the database:', existingCount);
    return { insertedCount: 0, existingCount };
  }
  const result = await collection.insertMany(data);
  console.log('Inserted documents:', result.insertedCount);
  return { insertedCount: result.insertedCount, existingCount: 0 };
}

async function runImport() {
  try {
    const db = await connectToDatabase();
    await loadData(db);
  } catch (error) {
    console.error('Could not import sample items:', error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

if (require.main === module) runImport();

module.exports = { loadData, data };