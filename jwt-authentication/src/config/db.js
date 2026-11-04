import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async() => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("DataBase connected successfully...")
    } catch (error) {
        console.error("Error while connecting DataBase...");
        throw error;
    }
}
