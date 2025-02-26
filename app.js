import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { adminDB, clientDB, salesCrmDb } from "./config/db.connection.js";
import adminRouter from "./routes/admin.route.js";
import clientRouter from "./routes/client.route.js";
import salesCrmRouter from "./routes/salesCRM.router.js";

// APP CONFIGURATION
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ACTUAL ROUTES
app.use("/v1/api/", adminRouter);
app.use("/v2/api/", clientRouter);
app.use("/v3/api/", salesCrmRouter);

// ROUTES => HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.send("<h1>Server Healthy</h1>");
});

export default app;
