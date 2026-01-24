import dbConnection from './DB/connection.js';
import qs from 'qs'
import { config } from 'dotenv';
import { routerHandler } from './router-handler.js';



const bootstrap = (app, express) => {


config()

app.set('query parser', str => qs.parse(str));
routerHandler(app, express)

dbConnection();

}


export default bootstrap;