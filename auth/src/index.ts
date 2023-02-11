import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not available");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not available");
  }
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

start();
