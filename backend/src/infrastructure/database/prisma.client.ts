import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient | null = null;

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return DatabaseConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
      DatabaseConnection.instance = null;
    }
  }
}

export const prisma = DatabaseConnection.getInstance();
export const disconnectDatabase = DatabaseConnection.disconnect;
