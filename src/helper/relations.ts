import inquirer from "inquirer";
import { validateOnlyString } from "./fieldInput";

export async function askRelations() {
  const relations: any[] = [];

  const { hasRelations } = await inquirer.prompt({
    type: "confirm",
    name: "hasRelations",
    message: "Do you want to add relations?",
    default: false,
  });

  if (!hasRelations) return relations;

  let addMore = true;

  while (addMore) {
    const ans = await inquirer.prompt([
      {
        type: "select",
        name: "type",
        message: "Relation type",
        choices: ["1:1", "1:N", "N:N"],
      },
      {
        type: "input",
        name: "target",
        message: "Target model name",
        validate: validateOnlyString,
      },
    ]);

    relations.push({
      type: ans.type,
      target: ans.target.charAt(0).toUpperCase() + ans.target.slice(1),
    });

    const { more } = await inquirer.prompt({
      type: "confirm",
      name: "more",
      message: "Add another relation?",
      default: false,
    });

    addMore = more;
  }

  return relations;
}
