import dbConnection from './DB/connection.js';
import qs from 'qs'
import express from 'express';
import { config } from 'dotenv';
import { disableCouponsCron } from './src/Utils/index.js';
import { gracefulShutdown } from 'node-schedule';
import { routerHandler } from './router-handler.js';



const bootstrap = () => {


config()


const app = express();


const port = process.env.PORT;

app.set('query parser', str => qs.parse(str));
routerHandler(app)

dbConnection();

disableCouponsCron()
gracefulShutdown()

app.listen(port, () => console.log(`Server is running on localhost: ${port}`))

}


export default bootstrap;