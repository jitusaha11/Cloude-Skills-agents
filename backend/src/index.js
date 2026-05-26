const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { Queue } = require('bullmq');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL setup
const pool = new Pool();

// Redis setup
const redis = new Redis();
const queue = new Queue('task-queue', { connection: redis });

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});