export function generateDbConfig(moduleType: string, dialect: string) {
  const isESM = moduleType === "module";

  // 🟢 MONGODB (MONGOOSE)
  if (dialect === "mongodb") {
    return isESM
      ? `
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
`
      : `
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
  }

  //  SEQUELIZE (MYSQL / MSSQL / POSTGRES)
  return isESM
    ? `
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "${dialect}",
  }
);

export default sequelize;
`
    : `
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "${dialect}",
  }
);

module.exports = sequelize;
`;
}
