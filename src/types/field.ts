export type Field = {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
  enumValues?: string[];
};
