import express from 'express';
import bootstrap from "./bootstrap.js"

const port = process.env.PORT || 3000;

const app = express();

bootstrap(app, express)


app.listen(port, () => console.log(`Server is running on localhost: ${port}`))