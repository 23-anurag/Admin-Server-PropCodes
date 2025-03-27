import express from "express";
import {
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
  ADMIN_REGITSER,
  CHECK_ADMIN_AUTH,
  CREATE_PLAN,
  DELETE_PLAN,
  GET_ADMIN_DETAILS,
  GET_ALL_PLANS,
  UPDATE_PLAN,
} from "../controllers/admin.controller.js";
import { VERIFY_ADMIN } from "../middlewares/auth.middleware.js";
const adminRouter = express.Router();

adminRouter.post("/adminRegister", ADMIN_REGITSER);
adminRouter.post("/adminLogin", ADMIN_LOGIN);
adminRouter.get("/get-admin-details", VERIFY_ADMIN, GET_ADMIN_DETAILS);
// adminRouter.get('/check-admin-auth', CHECK_ADMIN_AUTH)
adminRouter.post("/adminLogout", VERIFY_ADMIN, ADMIN_LOGOUT);
adminRouter.get("/get-all-plans", VERIFY_ADMIN, GET_ALL_PLANS);
adminRouter.post("/create-plan", VERIFY_ADMIN, CREATE_PLAN);
adminRouter.put("/update-plan/:id", VERIFY_ADMIN, UPDATE_PLAN);
adminRouter.delete("/delete-plan/:id", VERIFY_ADMIN, DELETE_PLAN);

export default adminRouter;
