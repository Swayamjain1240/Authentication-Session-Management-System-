import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
    },
},{timestaamp:true})

const userModel = mongoose.model("users",userSchema);

export default userModel;