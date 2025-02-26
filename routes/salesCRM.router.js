import express from "express";
import {
  GET_ALL_CRM_USERS,
  REGISTER_CRM_USER,
  GET_SINGLE_CRM_USER_DETAILS,
  UPDATE_CRM_USER,
  UPDATE_CRM_USER_PASSWORD,
  UPDATE_CRM_USER_STATUS,
  DELETE_CRM_USER
} from "../controllers/salesCRM.controller.js";
import { VERIFY_ADMIN } from "../middlewares/auth.middleware.js";

const salesCrmRouter = express.Router();

salesCrmRouter.post("/add-crm-employee",VERIFY_ADMIN, REGISTER_CRM_USER);
salesCrmRouter.get("/get-all-crm-employees",VERIFY_ADMIN, GET_ALL_CRM_USERS);
salesCrmRouter.get('/get-single-employee-details/:emp_id', VERIFY_ADMIN, GET_SINGLE_CRM_USER_DETAILS);
salesCrmRouter.put('/update-crm-employee/:emp_id', VERIFY_ADMIN, UPDATE_CRM_USER)
salesCrmRouter.put('/update-crm-employee-password/:emp_id', VERIFY_ADMIN, UPDATE_CRM_USER_PASSWORD)
salesCrmRouter.put('/update-crm-employee-status/:emp_id', VERIFY_ADMIN, UPDATE_CRM_USER_STATUS)
salesCrmRouter.delete('/delete-crm-user/:emp_id', VERIFY_ADMIN, DELETE_CRM_USER)

export default salesCrmRouter;
