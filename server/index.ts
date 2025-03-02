import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
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

// Server startup
(async () => {
  try {
    log('Starting server initialization...');

    // Run database migrations
    log('Running database migrations...');
    await runMigrations();
    log('Database migrations completed successfully');

    // Register routes
    log('Registering routes...');
    const server = await registerRoutes(app);
    log('Routes registered successfully');

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error handler caught: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // Setup Vite/Static serving
    if (app.get("env") === "development") {
      log('Setting up Vite middleware...');
      await setupVite(app, server);
      log('Vite middleware setup completed');
    } else {
      log('Setting up static file serving...');
      serveStatic(app);
      log('Static file serving setup completed');
    }

    // Start server
    await new Promise<void>((resolve, reject) => {
      try {
        const serverInstance = server.listen({
          port: 5000,
          host: "0.0.0.0"
        }, () => {
          log('Server started successfully on port 5000');
          resolve();
        });

        serverInstance.on('error', (error: Error & { code?: string }) => {
          if (error.code === 'EADDRINUSE') {
            log('Error: Port 5000 is already in use');
          } else {
            log(`Server error: ${error.message}`);
          }
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });

  } catch (error) {
    log(`Fatal error during server startup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
})();