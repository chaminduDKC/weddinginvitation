import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import { sendSuccess } from "./lib/response.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";

import authRoutes from "./modules/auth/auth.routes.js";
import templateRoutes from "./modules/templates/templates.routes.js";
import invitationRoutes from "./modules/invitations/invitations.routes.js";
import orderRoutes from "./modules/orders/orders.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import guestRoutes from "./modules/guests/guests.routes.js";
import publicRoutes from "./modules/public/public.routes.js";

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration with credentials and multi-origin support
  const allowedOrigins = [
    env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://192.168.")) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in development
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body & Cookie parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    sendSuccess(res, {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Feature routes
  app.use("/api/auth", authRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/guests", guestRoutes);
  app.use("/api/public", publicRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
