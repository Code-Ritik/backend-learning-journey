import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { generateTokens, verifyRefreshToken } from "../utils/auth.js";
import { config } from "../config/config.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const hashToken = (token) => {
  const hashRefreshToken = createHash("sha256").update(token).digest("hex");

  return hashRefreshToken;
};

const refreshCookieSecure = {
  httpOnly: true,
  sameSite: "strict",
  secure: config.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

const normalizationEmail = (email) => email.trim().toLowerCase();

const validateRegisterInput = ({ name, email, password }) => {
  const errors = [];

  if (
    typeof name !== "string" ||
    name.trim().length < 3 ||
    name.trim().length > 20
  ) {
    errors.push({
      path: "name",
      message: "Name must be 3 to 20 character long",
    });
  }

  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push({ path: "email", message: "Please enter a valid email" });
  }

  if (typeof password !== "string" || password.trim().length < 8) {
    errors.push({ path: "password", message: "Password should be 8 character long" });
  }

  return errors;
};

export const authRegisterController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = validateRegisterInput({ name, email, password });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        error: errors,
      });
    }

    const validEmail = normalizationEmail(email);

    const isUserExist = await userModel.findOne({ email: validEmail });

    if (isUserExist) {
      return res.status(400).json({
        message: "User is already exists",
        error: [
          {
            path: "email",
            message: "user already exists",
          },
        ],
      });
    }

    const user = await userModel.create({
      name: name.trim(),
      email: validEmail,
      passwordHash: await bcrypt.hash(password.trim(), 12),
    });

    const { accessToken, refreshToken } = generateTokens({ userId: user._id });

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieSecure);

    return res.status(201).json({
      message: "user register successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
      },
      accessToken,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        error: Object.values(error.errors).map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const authGetMeController = async (req, res) => {
  const user = req.user;

  res.status(200).json({
    message: "User data is fetched...",
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
    },
  });
};

export const authRefreshController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized, refresh token is not found",
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        message: "Unauthorized, Invalid type token 1",
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized, User not found",
      });
    }

    const cookieRefreshTokenHash = hashToken(refreshToken);

    if (cookieRefreshTokenHash !== user.refreshToken) {
      user.refreshToken = null;
      await user.save();

      return res.status(401).json({
        message: "Unauthorized, refresh token mismatch",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user._id,
    });

    res.cookie("refreshToken", newRefreshToken, refreshCookieSecure);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized, Invalid token",
    });
  }
};

export const authLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({
        message: "Please provide valid credentials",
      });
    }

    if (typeof password !== "string" || password.trim().length === 0) {
      return res.status(400).json({
        message: "Please provide valid credentials",
      });
    }

    const user = await userModel.findOne({ email: normalizationEmail(email) });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password.trim(), user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens({ userId: user._id });

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieSecure);

    res.status(200).json({
      message: "User Logged In",
      data: {
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
