require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB || 'secondChance';
let client;
let dbInstance;
let connectionPromise;

async function connectToDatabase() {
  if (dbInstance) return dbInstance;
  if (!url) throw new Error('MONGO_URL must be configured');

  if (!connectionPromise) {
    client = new MongoClient(url);
    connectionPromise = (async () => {
      try {
        await client.connect();
        dbInstance = client.db(dbName);
        return dbInstance;
      } catch (error) {
        connectionPromise = null;
        client = null;
        throw error;
      }
    })();
  }

  return connectionPromise;
}

async function closeDatabase() {
  if (client) await client.close();
  client = null;
  dbInstance = null;
  connectionPromise = null;
}

module.exports = connectToDatabase;
module.exports.closeDatabase = closeDatabase;
