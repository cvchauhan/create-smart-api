export function generateDbConnectionCode(db: string, isESM: boolean) {
  if (db === "mongodb") {
    return isESM
      ? `
import connectDB from "./config/db.js";

await connectDB();
`
      : `
const connectDB = require("./config/db");

(async () => {
  await connectDB();
})();
`;
  }

  // Sequelize (mysql / mssql)
  return isESM
    ? `
import sequelize from "./config/db.js";

await sequelize.authenticate();
console.log("DB connected");
`
    : `
const sequelize = require("./config/db");

(async () => {
  await sequelize.authenticate();
  console.log("DB connected");
})();
`;
}
