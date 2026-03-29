import { writeFile } from "fs/promises";

export default async function generateEnvFile(
  port: number,
  envPath: string,
  dialect: string,
) {
  const envContent =
    dialect === "mongodb"
      ? `DB_URL=mongodb://localhost:27017/mydb
PORT=${port}
        `
      : `
DB_NAME=test_db
DB_USER=root
DB_PASS=password
DB_HOST=localhost
PORT=${port}
  `;
  await writeFile(envPath, envContent);
}
