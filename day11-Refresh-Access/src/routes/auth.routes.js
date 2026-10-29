import { Router } from "express";
import { authGetMeController, authRefreshTokenController, authRegisterController } from "../controller/auth.controllers.js";

const router = Router();

router.post("/register", authRegisterController);

router.get("/me", authGetMeController)

router.post("/refresh", authRefreshTokenController)

export default router;
