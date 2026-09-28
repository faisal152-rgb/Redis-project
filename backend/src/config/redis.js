// config/redis.js
const Redis = require('ioredis');

// Fallback to localhost URL if the environment variable isn't set
const redisUrl = process.env.REDIS_URL;

// Initialize using the URL string
const redis = new Redis(redisUrl);

// Connection event logging
redis.on('connect', () => console.log('Redis client connecting...'));
redis.on('ready', () => console.log('Redis client connected and ready to use.'));
redis.on('error', (err) => console.error('Redis Client Error:', err));

module.exports = redis;

