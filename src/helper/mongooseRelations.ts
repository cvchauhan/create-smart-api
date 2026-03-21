export function generateMongooseRelations(relations: any[]) {
  return relations
    .map((r) => {
      if (r.type === "1:N" || r.type === "N:N") {
        return `
  ${r.target.toLowerCase()}s: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }]`;
      }

      return `
  ${r.target.toLowerCase()}: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }`;
    })
    .join(",");
}
