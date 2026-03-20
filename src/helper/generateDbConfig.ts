export function generateDbConfig(moduleType: string, dialect: string) {
  const isESM = moduleType === "module";

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
