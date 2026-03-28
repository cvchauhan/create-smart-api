import {
  generateSequelizeModel,
  generateMongooseModel,
} from "../../utils/model.util";

describe("generateSequelizeModel", () => {
  it("should generate sequelize model (ESM)", () => {
    const fields = [
      {
        name: "name",
        type: "string",
        required: true,
        unique: true,
      },
    ] as any;

    const result = generateSequelizeModel(fields, "User", true, []);

    expect(result).toContain("sequelize.define");
    expect(result).toContain("allowNull: false");
    expect(result).toContain("unique: true");
    expect(result).toContain("export default User");
  });

  it("should generate 1:N relations", () => {
    const fields: any[] = [];

    const relations = [
      {
        type: "1:N",
        target: "Order",
      },
    ];

    const result = generateSequelizeModel(fields, "User", true, relations);

    expect(result).toContain("hasMany");
    expect(result).toContain("belongsTo");
    expect(result).toContain("foreignKey");
  });

  it("should generate N:N relations", () => {
    const result = generateSequelizeModel([], "User", true, [
      { type: "N:N", target: "Role" },
    ]);

    expect(result).toContain("belongsToMany");
    expect(result).toContain("through");
    expect(result).toContain("UserRole");
  });
});

describe("generateMongooseModel", () => {
  it("should generate mongoose model (ESM)", () => {
    const fields = [
      {
        name: "email",
        type: "string",
        required: true,
        unique: true,
      },
    ] as any;

    const result = generateMongooseModel(fields, "User", true, []);

    expect(result).toContain("mongoose.Schema");
    expect(result).toContain("required: true");
    expect(result).toContain("unique: true");
    expect(result).toContain("mongoose.model");
  });

  it("should remove duplicate relation fields", () => {
    const fields = [
      { name: "role", type: "string" },
      { name: "email", type: "string" },
    ] as any;

    const relations = [{ type: "1:1", target: "Role", field: "role" }];

    const result = generateMongooseModel(fields, "User", true, relations);

    // role should be replaced by relation field (ObjectId ref)
    expect(result).toContain('ref: "Role"');
  });

  it("should generate mongoose relations (1:N array)", () => {
    const result = generateMongooseModel([], "User", true, [
      { type: "1:N", target: "Order" },
    ]);

    expect(result).toContain("Schema.Types.ObjectId");
    expect(result).toContain('ref: "Order"');
    expect(result).toContain("[{");
  });
});
