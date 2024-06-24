import express from 'express';

import cors from 'cors';    // allows the server to accept requests from the client

import cookieParser from 'cookie-parser';

const app = express();




app.use(cors({
    origin: process.env.CORS,   // in the env file we have allowed it from anywhere by using *
    credentials: true
}));



app.use(express.json({    // This middleware parses incoming requests with JSON payloads
    limit: '50mb'           // getting the json
}));
 
app.use(express.urlencoded({    // getting the data from the url
    limit: '50mb',
    extended: true
}));

app.use(express.static('public'));   // it is used to store images and such satatic files


app.use(cookieParser());   // to access the cookies of the user browser


// routes

import userRouter from './routes/user.routes.js';



// routes declaration
app.use("/api/v1/users", userRouter);     // i first will have /user and the next is mentioned in the user.routes.js file




export {app};