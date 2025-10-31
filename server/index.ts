import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleConfig } from "./routes/config";
import { handleGetUsers, handleApproveSponsor, handleDeclineSponsor, handleBulkApprove, handleUpsertUser, handleLogin, handleChangePassword } from "./routes/users";
import { handleGetIncomingForSponsor, handleAddConnection, handleAcceptConnection, handleDeclineConnection, handleGetConnectionStatus } from "./routes/connections";
import { handleGetMessagesForUser, handlePostMessage } from "./routes/messages";
import { handleHealth } from "./routes/health";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Health check for DB availability
  app.get("/api/health", handleHealth);

  app.get("/api/demo", handleDemo);
  app.get("/api/config", handleConfig);
  app.get("/api/users", handleGetUsers);
  app.post("/api/sponsors/:id/approve", handleApproveSponsor);
  app.post("/api/sponsors/:id/decline", handleDeclineSponsor);
  app.post("/api/sponsors/bulk_approve", handleBulkApprove);

  app.get("/api/connections/sponsor/:id/incoming", handleGetIncomingForSponsor);
  app.get("/api/connections/status", handleGetConnectionStatus);
  app.post("/api/connections", handleAddConnection);
  app.post("/api/connections/accept", handleAcceptConnection);
  app.post("/api/connections/decline", handleDeclineConnection);

  app.get("/api/messages/user/:id", handleGetMessagesForUser);
  app.post("/api/messages", handlePostMessage);
  app.post("/api/users/upsert", handleUpsertUser);
  app.post("/api/users/login", handleLogin);
  app.post("/api/users/change-password", handleChangePassword);

  return app;
}
