## 📦 create-smart-api — Smart Node.js Backend Generator

A powerful **CLI toolkit** to generate **production-ready Node.js REST APIs** with advanced scaffolding, interactive schema builder, and database integration.

---

## 🚀 What’s New 🔥

- 🧠 **Interactive Schema Builder**
- 📊 **Table Preview before model creation**
- ✏️ Edit / Add / Delete fields dynamically
- ⚡ **Bulk field input support**
- 🔍 **Auto typo correction (string, boolean, etc.)**
- 🧩 Supports **Sequelize & Mongoose models**
- 📁 Auto `.env` + DB config generation
- 🔄 Real DB-connected CRUD APIs (not dummy)

---

## 🚀 Features

- Express.js or Fastify support
- CommonJS & ES Modules
- Clean architecture (Controller / Service / Model / Route)
- Smart CRUD generator
- JWT authentication
- Validation (Zod/Joi)
- Jest testing setup
- Swagger/OpenAPI docs
- Plugin system

---

## 📦 Installation

### Run with npx (recommended)

```bash
npx create-smart-api create my-api
```

### Or install globally

```bash
npm install -g create-smart-api
```

---

## ⚡ Quick Start

```bash
create-smart-api create my-api
```

Follow CLI prompts:

- Project name
- Framework (Express / Fastify)
- Module system (CommonJS / ESM)
- Database:
  - MongoDB (Mongoose)
  - MySQL (Sequelize)
  - MSSQL (Sequelize)

- Generate CRUD module
- Port

---

## 🧠 Smart CRUD Generator (🔥 Highlight Feature)

```bash
create-smart-api generate:crud user
```

### ✨ Step 1: Bulk Field Input

```bash
name:string,email:string,age:number,status:enum
```

---

### ✨ Step 2: Field Enhancements

- Required
- Unique
- Default values
- Enum values

---

### 📊 Step 3: Table Preview

```
📊 Schema Preview

┌───┬─────────┬────────┬─────┬─────┬─────────┬────────────────────┐
│ # │ Field   │ Type   │ Req │Uniq │ Default │ Extra              │
├───┼─────────┼────────┼─────┼─────┼─────────┼────────────────────┤
│ 1 │ name    │ string │ ✔   │ ✖   │ -       │ -                  │
│ 2 │ email   │ string │ ✔   │ ✔   │ -       │ -                  │
│ 3 │ status  │ string │ ✖   │ ✖   │ active  │ enum(active,inact) │
└───┴─────────┴────────┴─────┴─────┴─────────┴────────────────────┘
```

---

### ✏️ Step 4: Edit Before Confirm

Options:

- Edit field
- Add new field
- Delete field
- Continue

---

## 🧩 Database Support

### 🟢 Sequelize (MySQL / MSSQL)

- Auto model generation
- Proper type mapping
- Validation & constraints

### 🟢 Mongoose (MongoDB)

- Schema-based model
- Enum support
- Default values
- Ready-to-use models

---

## 📁 Generated Structure

```
my-api/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
├── .env
└── package.json
```

---

## ⚙️ CLI Commands

### Create project

```bash
create-smart-api create my-api
```

---

### Generate CRUD

```bash
create-smart-api generate:crud user
```

---

### Generate Auth

```bash
create-smart-api generate:auth
```

---

### Generate Service

```bash
create-smart-api generate:service
```

---

### Generate Validation

```bash
create-smart-api generate:validation user
```

---

### Generate Tests

```bash
create-smart-api generate:test user
```

---

### Generate Swagger Docs

```bash
create-smart-api generate:swagger
```

---

## 🧪 Testing

```bash
npm test
```

---

## ⚠️ Important Note

If no models are created:

```
⚠️ Project created successfully, but no models were generated.

Database operations and related features may not work.

👉 Run:
create-smart-api generate:crud <module-name>
```

---

## 🔌 Plugin System

```bash
create-smart-api plugin install redis
```

---

## 🗺️ Roadmap

- Relations (1:1, 1:N, N:N)
- GraphQL generator
- Redis cache support
- Microservices support
- AI-based API generation

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Add tests
4. Submit PR

---

## 📄 License

MIT

---

## 👨‍💻 Author

Created by Chirag Chauhan

⭐ Star the repo if you like it!
