import { Router } from "express";
import { getUserDetails, login, logout, register } from "../controllers/auth.controller";
import { verifyJWT } from "@org/utils";

const router = Router();


router.post('/register' , register);
router.post('/login' , login);
router.get("/logout", logout);
router.get("/userDetail" , verifyJWT , getUserDetails);



export default router;
