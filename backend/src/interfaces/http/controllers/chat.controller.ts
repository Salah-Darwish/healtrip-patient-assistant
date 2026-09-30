import { Request, Response, NextFunction } from 'express';
import { OrchestrateChatUseCase } from '../../../application/use-cases/orchestrate-chat.use-case.js';
import { IChatRepository } from '../../../domain/repositories/chat.repository.interface.js';

export class ChatController {
  constructor(
    private readonly orchestrateChatUseCase: OrchestrateChatUseCase,
    private readonly chatRepo: IChatRepository
  ) {}

  public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, message, language } = req.body;

      const result = await this.orchestrateChatUseCase.execute({
        sessionId,
        message,
        language,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.chatRepo.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ success: false, error: { message: 'Session not found' } });
      }
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  public createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = (req.body.language as 'en' | 'ar') || 'en';
      const session = await this.chatRepo.createSession(language);
      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };
}
