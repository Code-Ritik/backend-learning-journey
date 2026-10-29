import app from "./app/app.js";
import { connectDB } from "./config/db.js";
import config from "./config/config.js";

//global await means 1st run connectDB funtion then other
await connectDB()

app.listen(config.PORT, ()=>{
    console.log("Server is running on port 3000")
})

