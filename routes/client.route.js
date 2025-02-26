import express from "express";

import {
  GET_ALL_CLIENTS,
  UPDATE_CLIENT,
} from "../controllers/client.controller.js";
import { VERIFY_ADMIN } from "../middlewares/auth.middleware.js";

const clientRouter = express.Router();

clientRouter.get("/getAllClients",VERIFY_ADMIN, GET_ALL_CLIENTS);
clientRouter.put("/updateClient/:id",VERIFY_ADMIN, UPDATE_CLIENT);

export default clientRouter;
