import app from "./src/app.js";
import connectDb from "./src/config/database.js";
import dns from "dns"

dns.setServers(["1.1.1.1","8.8.8.8"])

const PORT = process.env.PORT || 3000;

app.listen(3000,()=>{
    console.log("server running...")
    connectDb();
})