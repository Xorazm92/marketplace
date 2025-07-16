import express from 'express';
import cors from 'cors';

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'INBOLA Backend Test Server is running!'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'INBOLA API is working!',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api',
      '/api/test'
    ]
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    data: {
      server: 'INBOLA Backend',
      status: 'running',
      port: process.env.PORT || 4000
    }
  });
});

const port = process.env.PORT || 4000;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 INBOLA Test Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API: http://localhost:${port}/api`);
});
