import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureJwtSecret } from './utils/jwtSecret.js';

ensureJwtSecret();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('\nEnsure MONGO_URI is set in your .env file.');
    console.error('Copy .env.example to .env and add your MongoDB connection string.');
    process.exit(1);
  }
};

startServer();
