import inquirer from "inquirer";
import { Field } from "../types/field";
import { log } from "./chalk";

export async function deleteField(fields: Field[]) {
  if (fields.length === 0) {
    log.warn("No fields to delete");
    return;
  }

  const { fieldName } = await inquirer.prompt({
    type: "select",
    name: "fieldName",
    message: "Select field to delete:",
    choices: fields.map((f) => f.name),
  });

  const index = fields.findIndex((f) => f.name === fieldName);

  if (index !== -1) {
    fields.splice(index, 1);
    log.success(`Field "${fieldName}" deleted`);
  }
}
