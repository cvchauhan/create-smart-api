export function generateSequelizeRelations(name: string, relations: any[]) {
  let code = "";

  relations.forEach((r) => {
    if (r.type === "1:N") {
      code += `
    ${name}.hasMany(models.${r.target});
    models.${r.target}.belongsTo(${name});`;
    }

    if (r.type === "1:1") {
      code += `
    ${name}.hasOne(models.${r.target});
    models.${r.target}.belongsTo(${name});`;
    }

    if (r.type === "N:N") {
      const through = `${name}${r.target}`;
      code += `
    ${name}.belongsToMany(models.${r.target}, { through: "${through}" });
    models.${r.target}.belongsToMany(${name}, { through: "${through}" });`;
    }
  });

  return code;
}
