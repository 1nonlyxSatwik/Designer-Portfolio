import app from "./app.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env["PORT"] || 3000);

app.listen(port, (err?: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

export default app;

