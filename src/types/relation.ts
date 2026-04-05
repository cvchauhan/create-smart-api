type Relation = {
  type: "1:N" | "N:1" | "1:1" | "N:N";
  target: string;
  field?: string; // alias
  inverseField?: string; // optional override
  through?: string;
};

export default Relation;
