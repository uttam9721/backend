const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
require("dotenv").config();
const cookieParser = require('cookie-parser');
const {connectDb} = require("./connection");
connectDb();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})