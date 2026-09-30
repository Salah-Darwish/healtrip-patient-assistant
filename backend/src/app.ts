import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.config.js';
import { PrismaDoctorRepository } from './infrastructure/database/prisma-doctor.repository.js';
import { PrismaHospitalRepository } from './infrastructure/database/prisma-hospital.repository.js';
import { PrismaChatRepository } from './infrastructure/database/prisma-chat.repository.js';
import { OpenAiProvider } from './agent/providers/openai.provider.js';
import { SimulationProvider } from './agent/providers/simulation.provider.js';
import { AgentService } from './agent/agent.service.js';
import { OrchestrateChatUseCase } from './application/use-cases/orchestrate-chat.use-case.js';
import { ChatController } from './interfaces/http/controllers/chat.controller.js';
import { CatalogController } from './interfaces/http/controllers/catalog.controller.js';
import { createApiRouter } from './interfaces/http/routes/api.routes.js';
import { errorHandler } from './interfaces/http/middlewares/error-handler.middleware.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Root landing page (Handles browser visits on port 3001 gracefully)
  app.get('/', (req: Request, res: Response) => {
    if (req.accepts('html')) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HealTrip API | Service Status</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background: #0B192C;
              color: #F8FAFC;
              margin: 0;
              padding: 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .card {
              background: #1E293B;
              border: 1px solid #334155;
              border-radius: 16px;
              padding: 2.5rem;
              max-width: 580px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
              text-align: center;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: rgba(16, 185, 129, 0.15);
              color: #34D399;
              border: 1px solid rgba(16, 185, 129, 0.3);
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 0.85rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
            }
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #34D399;
            }
            h1 {
              font-size: 1.6rem;
              font-weight: 700;
              color: #FFFFFF;
              margin: 0 0 0.75rem 0;
            }
            p {
              font-size: 0.95rem;
              color: #94A3B8;
              line-height: 1.6;
              margin: 0 0 2rem 0;
            }
            .btn-app {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              background: linear-gradient(135deg, #00A896, #0284C7);
              color: white;
              text-decoration: none;
              font-weight: 700;
              font-size: 1.05rem;
              padding: 14px 28px;
              border-radius: 10px;
              box-shadow: 0 4px 14px rgba(0, 168, 150, 0.4);
              transition: transform 0.2s, opacity 0.2s;
            }
            .btn-app:hover {
              transform: translateY(-2px);
              opacity: 0.95;
            }
            .links {
              margin-top: 2rem;
              padding-top: 1.5rem;
              border-top: 1px solid #334155;
              display: flex;
              justify-content: center;
              gap: 1.25rem;
              font-size: 0.85rem;
            }
            .links a {
              color: #38BDF8;
              text-decoration: none;
            }
            .links a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">
              <span class="dot"></span>
              Backend API Active (Port 3001)
            </div>
            <h1>HealTrip AI Decision Backend</h1>
            <p>
              This is the backend REST API & AI Decision Engine. The interactive web application interface runs on port <strong>5173</strong>.
            </p>
            <a href="http://localhost:5173" class="btn-app">
              🚀 Open Web Application (localhost:5173)
            </a>
            <div class="links">
              <a href="/api/health" target="_blank">System Health JSON</a>
              <a href="/api/doctors" target="_blank">Doctors Directory</a>
              <a href="/api/hospitals" target="_blank">Hospitals Directory</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    res.json({
      service: 'HealTrip AI Patient Decision Assistant API',
      status: 'active',
      frontendUrl: 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        chatMessage: 'POST /api/chat/message',
        doctors: '/api/doctors',
        hospitals: '/api/hospitals',
      },
    });
  });

  // Repositories
  const doctorRepo = new PrismaDoctorRepository();
  const hospitalRepo = new PrismaHospitalRepository();
  const chatRepo = new PrismaChatRepository();

  // AI Provider
  let llmProvider;
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
    console.log(`🤖 Initializing OpenAI Provider with model: ${env.OPENAI_MODEL}`);
    llmProvider = new OpenAiProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);
  } else {
    console.log('⚡ Initializing Simulation Agent Provider (Offline Deterministic Mode with Real Tool Execution)');
    llmProvider = new SimulationProvider();
  }

  const agentService = new AgentService(llmProvider, doctorRepo, hospitalRepo);
  const orchestrateChatUseCase = new OrchestrateChatUseCase(chatRepo, doctorRepo, hospitalRepo, agentService);

  const chatController = new ChatController(orchestrateChatUseCase, chatRepo);
  const catalogController = new CatalogController(doctorRepo, hospitalRepo);

  // Mount API Router
  app.use('/api', createApiRouter(chatController, catalogController));

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
