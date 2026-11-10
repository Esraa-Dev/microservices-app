import express from "express";
import cors from "cors";
import { errorMiddleware } from "@ecommerce/error-handler";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { createOrder } from "./controllers/order.controller";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.post(
  "/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req: any, res, next) => {
    req.rawBody = req.body;
    next();
  },
  createOrder
);

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Order API" });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
  console.log(`Order service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server Error:", err);
});