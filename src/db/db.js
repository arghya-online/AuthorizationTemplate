import mongoose from "mongoose";

import { MONGO_DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`,
    );
    console.log(
      `\n Connected to MongoDB || DB_Host: ${connectionInstance.connection.host} || DB_Name: ${connectionInstance.connection.name} \n`,
    );
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export { connectDB };
