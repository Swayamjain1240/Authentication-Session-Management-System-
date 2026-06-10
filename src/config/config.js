import dotenv  from "dotenv";

dotenv.config();



const config = {
    MONGO_DB: process.env.MONGO_DB,
    JWT_SECRET: process.env.JWT_SECRET,
}
export default config ;