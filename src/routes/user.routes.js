import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//defining routes
//fields is used to specify the fields that will be uploaded

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

//secured routes
//verifyJWT checks the validity with middleware and the logoutUser is the controller function that will be called if the token is valid
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
