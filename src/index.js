import dotenv from "dotenv";
import express from "express";
const app = express();
import connectDB from "./db/index.js";
import { DB_NAME } from "./constant.js";
dotenv.config({
  path: "./env",
});
connectDB();

/*
import express from "express";
const app = express();


(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`app is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
})();
*/
