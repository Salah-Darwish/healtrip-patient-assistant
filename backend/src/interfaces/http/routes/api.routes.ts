import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { CatalogController } from '../controllers/catalog.controller.js';
import { HealthController } from '../controllers/health.controller.js';
import { validateBody } from '../middlewares/request-validator.middleware.js';
import { PostChatMessageSchema } from '../dtos/chat.dto.js';

export function createApiRouter(
  chatController: ChatController,
  catalogController: CatalogController
): Router {
  const router = Router();

  // Health and System Diagnostics
  router.get('/health', HealthController.getHealth);

  // Chat & Decision Engine Endpoints
  router.post('/chat/session', chatController.createSession);
  router.post('/chat/message', validateBody(PostChatMessageSchema), chatController.sendMessage);
  router.get('/chat/session/:id', chatController.getSession);

  // Clinical Directory Catalog Endpoints
  router.get('/doctors', catalogController.getDoctors);
  router.get('/doctors/:id', catalogController.getDoctorById);
  router.get('/hospitals', catalogController.getHospitals);
  router.get('/hospitals/:id', catalogController.getHospitalById);
  router.get('/specialties', catalogController.getSpecialties);
  router.get('/countries', catalogController.getCountries);

  return router;
}
