import express from "express";
import {
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
  ADMIN_REGITSER,
  CHECK_ADMIN_AUTH,
  GET_ADMIN_DETAILS,
} from "../controllers/auth.controller.js";
import { VERIFY_ADMIN } from "../middlewares/auth.middleware.js";
const adminRouter = express.Router();

adminRouter.post("/adminRegister", ADMIN_REGITSER);
adminRouter.post("/adminLogin", ADMIN_LOGIN);
adminRouter.get('/get-admin-details', VERIFY_ADMIN, GET_ADMIN_DETAILS)
// adminRouter.get('/check-admin-auth', CHECK_ADMIN_AUTH)
adminRouter.post("/adminLogout",VERIFY_ADMIN, ADMIN_LOGOUT);

export default adminRouter;
