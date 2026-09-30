import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { disconnectDatabase } from './infrastructure/database/prisma.client.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`
=====================================================
🏥 HealTrip AI Patient Decision Assistant Backend
=====================================================
📡 Server listening on: http://localhost:${env.PORT}
🌍 Environment:        ${env.NODE_ENV}
🧠 AI Engine:          ${env.AI_PROVIDER}
🛡️  Anti-Hallucination: ${env.ENABLE_ANTI_HALLUCINATION_GUARD ? 'ACTIVE' : 'DISABLED'}
🚨 Red-Flag Safety:    ${env.RED_FLAG_TRIAGE_OVERRIDE ? 'ACTIVE' : 'DISABLED'}
=====================================================
  `);
});

// Graceful Shutdown Handlers
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    await disconnectDatabase();
    console.log('🗄️ Database disconnected.');
    process.exit(0);
  });

  // Force shutdown if taking longer than 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
