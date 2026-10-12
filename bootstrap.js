import dbConnection from './DB/connection.js';
import qs from 'qs'
import { config } from 'dotenv';
import { routerHandler } from './router-handler.js';



const bootstrap = async (app, express) => {


config()

app.set('query parser', str => qs.parse(str));

// Ensure a live DB connection on every invocation (covers Vercel cold starts).
app.use(async (req, res, next) => {
  try {
    await dbConnection();
    next();
  } catch (error) {
    next(error);
  }
});

routerHandler(app, express)

// Fail fast at boot when the URI is bad (local dev / cold start).
await dbConnection();

}


export default bootstrap;
