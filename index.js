import express from 'express';
import bootstrap from "./bootstrap.js"

const port = process.env.PORT || 3000;

const app = express();

await bootstrap(app, express)

// Vercel serverless uses the exported app; only listen on long-lived hosts.
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server is running on localhost: ${port}`))
}

export default app;
