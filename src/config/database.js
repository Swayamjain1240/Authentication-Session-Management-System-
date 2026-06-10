import mongoose from "mongoose";
import config from "./config.js";


async function connectDb() {
    try {
        await mongoose.connect(config.MONGO_DB);
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDb