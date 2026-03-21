export function mapType(type: string) {
  const map: any = {
    string: "DataTypes.STRING",
    number: "DataTypes.INTEGER",
    boolean: "DataTypes.BOOLEAN",
    date: "DataTypes.DATE",
  };
  return map[type] || "DataTypes.STRING";
}
