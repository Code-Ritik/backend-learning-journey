import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required : [true, "Username is required"],
        minlength: 3,
        maxlength: 20,
        trim: true
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
    },
    passwordHash:{
        type:String,
        required:[true, "Password is required"],
        minlength: [8, "Password should be 8 character long"],
    },
    refreshToken:{
        type: String
    }
});

const userModel = mongoose.model("users", userSchema);

export default userModel;