# create-smart-api

A **CLI toolkit** for generating **production-ready Node.js REST APIs** with opinions, architecture, and best practices built in.

## 🚀 What it does

`create-smart-api` scaffolds a complete backend project with:

- ✅ Express.js + modular routing
- ✅ Controller / Service / Model architecture
- ✅ CRUD generator for resources
- ✅ Authentication (JWT + password hashing)
- ✅ Validation schemas (Zod/Joi)
- ✅ Testing setup (Jest)
- ✅ Swagger/OpenAPI docs support
- ✅ Docker support
- ✅ Plugin system for extensibility

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

2. Choose your database:
   - MongoDB
   - MySQL
   - MSSQL

3. The CLI will scaffold a production-ready Node.js API project.

---

## 📁 Generated Project Structure (example)

```
my-project
├── src
│   ├── controllers
│   ├── services
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── validations
│   └── config
├── tests
├── app.js
├── server.js
└── package.json
```

---

## ⚙️ CLI Commands

### Create a new project

```bash
create-smart-api create my-api
```

### Generate a CRUD module

```bash
create-smart-api generate:crud user
```

Generates:

```
src/modules/user
├── user.controller.js
├── user.service.js
├── user.routes.js
└── user.model.js
```

### Add authentication

```bash
create-smart-api generate:auth
```

Adds:

- JWT middleware
- Login / register endpoints
- Password hashing

### Add validation

```bash
create-smart-api generate:validation user
```

Generates a Zod/Joi validation schema for the specified resource.

### Add tests

```bash
create-smart-api generate:test user
```

Generates Jest test files for the resource.

### Add Swagger docs

```bash
create-smart-api add:swagger
```

Adds OpenAPI docs and Swagger UI for the project.

### Add Docker support

```bash
create-smart-api add:docker
```

Adds:

- `Dockerfile`
- `docker-compose.yml`

---

## 🧪 Running Tests

```bash
npm test
```

Example Jest test:

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

You can extend the CLI via plugins.

Example:

```bash
create-smart-api plugin install redis
```

Plugins can add features like:

- Caching
- Queues
- Microservices
- Monitoring

---

## 🐳 Docker

Generate Docker setup:

```bash
create-smart-api add:docker
```

Run the container:

```bash
docker-compose up
```

---

## 📦 Roadmap

Planned features:

- GraphQL generator
- Redis caching generator
- Kubernetes deployment templates
- Event-driven microservices
- AI-powered API generator

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create a feature branch
3. Add tests
4. Open a PR

---

## 📄 License

MIT

Fork repository

Create feature branch

Commit changes

Submit Pull Request

📄 License
MIT License

👨‍💻 Author
Created by backend developers for backend developers.

⭐ If you like this project, please give it a star on GitHub.

---
