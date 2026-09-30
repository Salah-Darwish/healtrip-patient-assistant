import express, { Express } from 'express';
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

  // Security & Utility Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Allows flexible integration in dev
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: (origin, callback) => {
      // Allow localhost dev origins or no origin (curl/mobile)
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
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

  // Dependency Injection & Inversion of Control
  const doctorRepo = new PrismaDoctorRepository();
  const hospitalRepo = new PrismaHospitalRepository();
  const chatRepo = new PrismaChatRepository();

  // LLM Provider Setup
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

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
