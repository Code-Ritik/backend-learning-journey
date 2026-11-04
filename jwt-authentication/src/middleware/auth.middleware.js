import { verifyAccessToken } from "../utils/auth.js";
import userModel from "../models/user.model.js";

export const authMiddleware = async(req, res, next)=>{
    const authHeader = req.headers.authorization.split(" ")[1]

    if(!authHeader){
        return res.status(401).json({
            message: "Unauthorized, Invalid token"
        })
    }

    try {

        const decoded = verifyAccessToken(authHeader);

        if(decoded.type !== "access"){
            return res.status(401).json({
                message: "Unauthorized, Invalid token type"
            })
        }

        const user = await userModel.findById(decoded.id);

        if(!user){
            return res.status(401).json({
                message: "Unauthorized, user not found"
            })
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, Invalid or expire token"
        })
    }

}