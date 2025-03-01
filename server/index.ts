import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations"; // Added import statement

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try using additional ports if default ones are busy
  const preferredPorts = [5000, 3000, 8080, 4000, 9000];

  async function startServer(portIndex = 0) { // Changed to async function
    if (portIndex >= preferredPorts.length) {
      log("All ports are in use. Unable to start server.");
      process.exit(1);
      return;
    }

    const port = preferredPorts[portIndex];
    try {
      // Run database migrations before listening
      await runMigrations(); 
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is busy, trying port ${preferredPorts[portIndex + 1]}...`);
        // Make sure we're calling the function with await to properly handle async
        await startServer(portIndex + 1);
      } else {
        log(`Error starting server: ${error.message}`);
        console.error(error);
        process.exit(1);
      }
    }
  }

  startServer();
})();