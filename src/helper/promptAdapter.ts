import prompts, { PromptObject } from "prompts";
import { log } from "./index";

/* ---------------- TYPES ---------------- */

type Choice =
  | string
  | {
      name?: string;
      title?: string;
      value: string | number | boolean;
    };

type Question = {
  type: string | ((answers: Record<string, any>) => string | null);
  name: string;
  message: string;
  choices?: Choice[];
  default?: any;
  when?: (answers: Record<string, any>) => boolean;
  validate?: (input: any) => boolean | string | Promise<boolean | string>;
  filter?: (value: any) => any;
  transform?: (value: any) => any;
};

/* ---------------- HELPERS ---------------- */

function mapType(
  type: Question["type"],
  answers: Record<string, any>,
): string | null {
  const resolved = typeof type === "function" ? type(answers) : type;

  if (!resolved) return null;

  switch (resolved) {
    case "input":
      return "text";
    case "rawlist":
    case "list":
    case "select":
      return "select";
    case "confirm":
      return "confirm";
    default:
      return resolved;
  }
}

function mapChoices(choices?: Choice[]) {
  if (!choices) return undefined;

  return choices.map((c) => {
    if (typeof c === "string") {
      return { title: c, value: c };
    }

    return {
      title: c.title || c.name || String(c.value),
      value: c.value,
    };
  });
}

/* ---------------- MAIN FUNCTION ---------------- */

export async function prompt<T = Record<string, any>>(
  questions: Question[],
): Promise<T> {
  const answers: Record<string, any> = {};

  for (const q of questions) {
    // ✅ handle "when"
    if (q.when && !q.when(answers)) continue;

    const resolvedType = mapType(q.type, answers);

    // ✅ skip if type is null
    if (!resolvedType) continue;

    let initial = q.default;

    const mappedChoices = mapChoices(q.choices);

    // 👉 if select + default is value → convert to index
    if (
      resolvedType === "select" &&
      mappedChoices &&
      typeof q.default !== "number"
    ) {
      const index = mappedChoices.findIndex((c) => c.value === q.default);
      if (index >= 0) {
        initial = index;
      }
    }

    const promptObj: PromptObject = {
      type: resolvedType as any,
      name: q.name,
      message: q.message,
      choices: mappedChoices,
      initial,
      validate: q.validate,
    };

    const res = await prompts(promptObj, {
      onCancel: () => {
        log.error("Operation cancelled");
        process.exit(1);
      },
    });

    answers[q.name] = res[q.name];
  }

  return answers as T; // 🔥 GENERIC FIX
}
