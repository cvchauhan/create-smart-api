import { Field } from "../types/field";
import inquirer from "inquirer";
import { parseFields } from "./parseFields";
import { enhanceFields } from "./enhanceFields";
import { log } from "./chalk";

export async function addField(fields: Field[]) {
  const { input } = await inquirer.prompt({
    type: "input",
    name: "input",
    message: "Enter new field (name:type)",
  });

  const parsed = await parseFields(input);

  if (parsed.length !== 1) {
    log.error("Only one field allowed here");
    return;
  }

  const newField = parsed[0];

  // prevent duplicate
  if (fields.find((f) => f.name === newField.name)) {
    log.error("Field already exists");
    return;
  }

  await enhanceFields([newField]);

  fields.push(newField);

  log.success(`Field "${newField.name}" added`);
}
