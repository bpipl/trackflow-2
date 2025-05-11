const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from env variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for Railway's PostgreSQL
  } : false
});

// Simple query method
module.exports = {
  query: (text, params) => pool.query(text, params),
  
  // Get a client from the pool for transactions
  getClient: async () => {
    const client = await pool.connect();
    
    // Monkey patch the query method to keep track of queries
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for too long!');
      console.error(`The last executed query was: ${client.lastQuery}`);
    }, 5000);
    
    // Store the query
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    // Clear the timeout and reset the query method before releasing
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};
