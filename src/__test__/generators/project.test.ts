import { createStructure } from "../../generators/project";
import fs from "fs-extra";
import path from "path";
import { log } from "../../helper";

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));
jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
  },
}));

describe("createStructure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const base = "/base";

  test("should create folder structure", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "commonjs",
      port: 3000,
      db: "mongodb",
    });

    const src = path.join(base, "src");

    expect(fs.mkdirp).toHaveBeenCalledWith(src);

    const folders = ["controllers", "services", "models", "routes", "config"];

    folders.forEach((folder) => {
      expect(fs.mkdirp).toHaveBeenCalledWith(path.join(src, folder));
    });
  });

  test("should create express commonjs server file", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "commonjs",
      port: 3000,
      db: "mongodb",
    });

    const serverPath = path.join(base, "src", "server.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      serverPath,
      expect.stringContaining('require("express")'),
    );
  });

  test("should create express ESM server file", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "module",
      port: 3000,
      db: "mongodb",
    });

    const serverPath = path.join(base, "src", "server.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      serverPath,
      expect.stringContaining("import express"),
    );
  });

  test("should create fastify commonjs server file", async () => {
    await createStructure(base, {
      framework: "fastify",
      moduleType: "commonjs",
      port: 3000,
      db: "mongodb",
    });

    const serverPath = path.join(base, "src", "server.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      serverPath,
      expect.stringContaining('require("fastify")'),
    );
  });

  test("should create fastify ESM server file", async () => {
    await createStructure(base, {
      framework: "fastify",
      moduleType: "module",
      port: 3000,
      db: "mongodb",
    });

    const serverPath = path.join(base, "src", "server.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      serverPath,
      expect.stringContaining("import Fastify"),
    );
  });

  test("should create routes index (commonjs)", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "commonjs",
      port: 3000,
      db: "mongodb",
    });

    const routesIndexPath = path.join(base, "src", "routes", "index.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      routesIndexPath,
      expect.stringContaining("module.exports"),
    );
  });

  test("should create routes index (ESM)", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "module",
      port: 3000,
      db: "mongodb",
    });

    const routesIndexPath = path.join(base, "src", "routes", "index.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      routesIndexPath,
      expect.stringContaining("export default"),
    );
  });

  test("should log success message", async () => {
    await createStructure(base, {
      framework: "express",
      moduleType: "commonjs",
      port: 3000,
      db: "mongodb",
    });

    expect(log.success).toHaveBeenCalledWith(
      "Server file created successfully",
    );
  });
});
