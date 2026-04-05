type Relation = {
  type: "1:1" | "1:N" | "N:N";
  target: string;
  field: string;
  required: boolean;
};

export default Relation;
