import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations";

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
  try {
    // Run database migrations first
    await runMigrations();
    log('Database migrations completed');

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // Set up Vite or static serving based on environment
    if (app.get("env") === "development") {
      await setupVite(app, server);
      log('Vite middleware setup completed');
    } else {
      serveStatic(app);
      log('Static serving setup completed');
    }

    // Create a promise for the server listen
    const startServer = new Promise((resolve, reject) => {
      const serverInstance = server.listen({
        port: 5000,
        host: "0.0.0.0",
      }, () => {
        log(`Server started successfully on port 5000`);
        resolve(serverInstance);
      });

      serverInstance.once('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE') {
          log(`Error: Port 5000 is already in use`);
        } else {
          log(`Error starting server: ${error.message}`);
        }
        reject(error);
      });
    });

    await startServer;
  } catch (error) {
    log(`Fatal error during server startup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
})();