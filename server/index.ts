import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced logging middleware
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
      if (req.method !== "GET" && req.body) {
        logLine += ` Request Body: ${JSON.stringify(req.body)}`;
      }
      if (capturedJsonResponse) {
        logLine += ` Response: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler with proper typing
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      const status = err instanceof HttpError ? err.status : 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ 
        message,
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
      });
    });

    // Setup Vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try using additional ports if default ones are busy
    const preferredPorts = [5000, 3000, 8080, 4000, 9000];

    async function startServer(portIndex = 0) {
      if (portIndex >= preferredPorts.length) {
        log("All ports are in use. Unable to start server.");
        process.exit(1);
        return;
      }

      const port = preferredPorts[portIndex];
      try {
        // Run database migrations first
        await runMigrations();

        // Create a promise for the server listen
        const startServerPromise = new Promise((resolve, reject) => {
          const serverInstance = server.listen({
            port,
            host: "0.0.0.0",
            reusePort: true,
          }, () => {
            log(`Server running on port ${port}`);
            resolve(serverInstance);
          });

          serverInstance.once('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
              log(`Port ${port} is busy, trying port ${preferredPorts[portIndex + 1]}...`);
              serverInstance.close();
              reject(error);
            } else {
              log(`Error starting server: ${error.message}`);
              console.error(error);
              reject(error);
            }
          });
        });

        await startServerPromise;
      } catch (error) {
        const typedError = error as NodeJS.ErrnoException;
        if (typedError.code === 'EADDRINUSE') {
          await startServer(portIndex + 1);
        } else {
          log(`Error in server setup: ${typedError.message}`);
          console.error(typedError);
          process.exit(1);
        }
      }
    }

    startServer();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Custom error class for HTTP errors
class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export { HttpError };