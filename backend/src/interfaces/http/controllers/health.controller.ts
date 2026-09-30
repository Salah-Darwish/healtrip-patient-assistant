import { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { env } from '../../../config/env.config.js';

export class HealthController {
  public static async getHealth(_req: Request, res: Response) {
    let dbStatus = 'disconnected';
    let doctorsCount = 0;
    let hospitalsCount = 0;

    try {
      [doctorsCount, hospitalsCount] = await Promise.all([
        prisma.doctor.count(),
        prisma.hospital.count(),
      ]);
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }

    res.json({
      status: 'ok',
      service: 'HealTrip AI Decision Assistant API',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      aiProvider: env.AI_PROVIDER,
      antiHallucinationGuard: env.ENABLE_ANTI_HALLUCINATION_GUARD,
      database: {
        status: dbStatus,
        indexedDoctors: doctorsCount,
        accreditedHospitals: hospitalsCount,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
