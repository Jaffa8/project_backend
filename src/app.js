import express from 'express';

import cors from 'cors';

import cookieParser from 'cookie-parser';

const app = express();


app.use(cors({
    origin: process.env.CORS,
    credentials: true
}));



app.use(express.json({    // this sets a limit on the size of the request body
    limit: '50mb'           // getting the json
}));
 
app.use(express.urlencoded({    // getting the data from the url
    limit: '50mb',
    extended: true
}));

app.use(express.static('public'));   // it is used to store images and such satatic files


app.use(cookieParser());   // to access the cookies of the user browser

export default app; 