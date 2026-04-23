const { createClient } = require('redis');

// Only create the client if we have a URI to avoid localhost connection errors in production
const redisClient = process.env.REDIS_URI 
  ? createClient({ url: process.env.REDIS_URI }) 
  : null;

if (redisClient) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
}

const connectRedis = async () => {
  if (!redisClient) {
    console.log('⚠️ Redis URI not found. Skipping Redis connection.');
    return;
  }
  try {
    await redisClient.connect();
    console.log('✅ Redis Connected Successfully');
  } catch (error) {
    console.error('❌ Redis Connection Error:', error);
  }
};

module.exports = { redisClient, connectRedis };
