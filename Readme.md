## 📦 create-smart-api — Production-ready Node.js REST API generator

A **CLI toolkit** for generating **production-ready Node.js REST APIs** with powerful scaffolding, architecture best practices, and built-in features.

---

## 🚀 What it does

`create-smart-api` scaffolds a complete backend project with:

- **Express.js or Fastify** with modular routing
- Controller, Service, Model, Route separation
- CRUD generator for resources
- JWT authentication (with password hashing)
- Validation schemas (Zod/Joi)
- Jest testing setup
- Swagger/OpenAPI documentation
- Plugin system for additional features

---

## 📦 Installation

### Run via npx (recommended)

```bash
npx create-smart-api create my-api
```

### Or install globally

```bash
npm install -g create-smart-api
```

Then create a project:

```bash
create-smart-api create my-api
```

---

## 🧰 Quick Start

1. Run the generator:

   ```bash
   create-smart-api create my-api
   ```

2. Follow the interactive CLI prompts:
   - **Project name**
   - **Framework:** Express or Fastify
   - **Module system:** CommonJS or ES Modules (ESM)
   - **Database:** MongoDB, MySQL, or MSSQL
   - **Generate sample CRUD:** Yes/No
   - **CRUD module name** (if Yes)
   - **Port number**

3. The CLI will scaffold a production-ready Node.js API project.

---

## 📁 Project Structure (Example)

```
my-api/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── validations/
│   ├── config/
|   ├── server.js
└── package.json
```

- Each CRUD module will be structured across controllers, services, models, and routes.

---

## ⚙️ CLI Commands

### Create a new project

```bash
create-smart-api create my-api
```

This will prompt you for options and scaffold the project.

### Generate a CRUD module

```bash
create-smart-api generate:crud user
```

Generates:

```
src/
├── controllers/user.controller.js
├── services/user.service.js
├── routes/user.routes.js
├── models/user.model.js
```

### Add authentication

```bash
create-smart-api generate:auth
```

Adds:

- JWT middleware
- login & register endpoints
- password hashing

### Add Service

```bash
create-smart-api generate:service
```

Adds:

- Create service file with getAll & create route

### Add validation

```bash
create-smart-api generate:validation user
```

Generates appropriate Zod/Joi schemas in `src/validations/`.

### Add tests

```bash
create-smart-api generate:test user
```

Generates Jest test files for the resource.

### Add Swagger docs

```bash
create-smart-api generate:swagger
```

Adds Swagger/OpenAPI docs and Swagger UI.

---

## 🧪 Running Tests

```bash
npm test
```

Sample Jest test:

```js
describe("User API", () => {
  it("should create user", async () => {
    const res = await request(app).post("/users").send({ name: "test" });
    expect(res.statusCode).toBe(201);
  });
});
```

---

## 🔌 Plugin System

Extend your backend with plugins.

Example:

```bash
create-smart-api plugin install redis
```

---

## 🗺️ Roadmap

- GraphQL API generator
- Redis cache generator
- Kubernetes deployment templates
- Event-driven microservices
- AI-powered API generator

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Add tests/documentation
4. Submit a PR

---

## 📄 License

MIT

---

Created by Chirag Chauhan and contributors. Star this project to support its development!
