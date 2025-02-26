import "dotenv/config";
import http from "http";
import app from "./app.js";
const PORT = process.env.PORT || 8000;

// INITIALISING SERVER
const server = http.createServer(app);

// STARTING SERVER
server.listen(PORT, () => {
  console.log(
    `Server is UP and running on http://localhost:${process.env.PORT}`
  );
});
