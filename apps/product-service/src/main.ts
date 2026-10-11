import express from "express";
import cors from "cors";
import { errorMiddleware } from "@ecommerce/error-handler";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/product.routes";
import "./jobs/product-crone.job"; 

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

app.use("/api/products", productRoutes);
app.use(errorMiddleware);

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server Error:", err);
});