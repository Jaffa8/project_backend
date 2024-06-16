import dotenv from 'dotenv';

import connectDB from './db/index.js';

dotenv.config({path: './env'});   //This line uses dotenv to load environment variables from a file named env


import {app} from './app.js';


connectDB()    // these are promises
.then(() => {
   app.listen(process.env.PORT, () => {
       console.log(`Server is running on port ${process.env.PORT}`);
   });
})
.catch((err) => {
    console.log('DB connection failed');
    console.log(err);
});









