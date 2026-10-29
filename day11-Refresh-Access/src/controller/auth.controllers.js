import bcrypts from "bcryptjs";
import userModel from "../model/user.model.js";
import { generateToken, verifyAccessToken, verifyRefreshToken } from "../utils/auth.js";


export const authRegisterController = async (req, res) => {
  const { name, email, password } = req.body;

  const isUserExists = await userModel.findOne({ email });

  if (isUserExists) {
    return res.status(400).json({
      message: "User already exists",
      errors: [
        {
          field: "email",
          message: "User already exists",
        },
      ],
    });
  }

  const user = await userModel.create({
    name,
    email,
    passwordHash: await bcrypts.hash(password, 10),
  });

  const {accessToken, refreshToken} = generateToken({ userId: user._id });

  //save refreshToken in database

  user.refreshToken = refreshToken;
  await user.save()

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  })


  res.status(201).json({
    message: "user register successfully...",
    data : {
        email : user.email,
        userId : user._id
    },
    accessToken
  })

}

export const authGetMeController = async(req, res)=>{
    const accessToken = req.headers.authorization?.split(" ")[1];

    if(!accessToken){
        return res.status(401).json({
            message: "Unauthorized, access token not found"
        })
    }

    try {
        const decoded = verifyAccessToken(accessToken);

        if(decoded.token_type !== "access"){
            return res.status(401).json({
                message: "Invalid Token Type"
            })
        }

        const user = await userModel.findById(decoded.id);

        res.status(200).json({
            message: "user fetched successfully...",
            data: {
                user:{
                    name: user.name,
                    email: user.email
                }
            }
        })
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, Invalid or Expired Access Token",
        })
    }
}

export const authRefreshTokenController = async(req, res)=> {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message: "Unauthorized, must required token"
        })
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);

        if(decoded.token_type !== "refresh"){
            return res.status(401).json({
                message: "Invalid Token Type"
            })
        }

        const user = await userModel.findById(decoded.id)

        if(refreshToken !== user.refreshToken){
            user.refreshToken = null;
            await user.save()

            return res.status(401).json({
                message: "Unauthorized, refresh token mismatch"
            })
        }

        const {accessToken, refreshToken : newRefreshToken} = generateToken({ userId: user._id });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true
        })

        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            message: "Token refreshed successfully..",
            accessToken
        })

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, Invalid or expired refresh token"
        })
    }
}
