import { Router } from "express";
import { authGetMeController, authLoginController, authRefreshController, authRegisterController } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authRegisterController);

router.post("/me", authMiddleware,authGetMeController);

router.post("/refresh", authRefreshController);

router.post("/login", authLoginController);

export default router;