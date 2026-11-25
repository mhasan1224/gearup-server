
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";

import connectDatabase from "./config/database.js";
import createAuth from "./config/auth.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import rootRouter from "./routes/index.js";
import stripeWebhookController from "./controllers/stripe-webhook.controller.js";

const createApp = (auth) => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhookController,
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "GearUp API server is running.",
      environment: process.env.NODE_ENV,
    });
  });

  app.use("/api", rootRouter(auth));

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

await connectDatabase();

const auth = createAuth();
const app = createApp(auth);

export default app;
