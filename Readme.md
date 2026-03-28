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

### Or use short form

```bash
npx create-smart-api c my-api
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

## OR Use Short form

```bash
create-smart-api c my-api
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

## OR Use Short form

```bash
create-smart-api g:c user
```

### ✨ Step 1: Bulk Field Input

## 🧩 Field Definition

### 🔹 Choose Input Mode

````bash
? How do you want to define fields?
❯ Interactive
  Quick input (name:string,...)

Field name: name
Type: string
Required? Yes
Unique? No
```

? How do you want to define fields?
  Interactive
❯ Quick input (name:string,...)

name:string,email:string,age:number,status:enum

````

---

### ✨ Step 2: Field Enhancements

- Required
- Unique
- Default values
- Enum values

---

### 📊 Step 3: Table Preview

```
## 📊 Schema Preview

| # | Field  | Type   | Req | Uniq | Default | Extra               |
|---|--------|--------|-----|------|---------|---------------------|
| 1 | name   | string | Yes | No   | -       | -                   |
| 2 | email  | string | Yes | Yes  | -       | -                   |
| 3 | status | string | No  | No   | active  | enum(active,inact)  |

---
```

### ✏️ Step 4: Edit Before Confirm

```
Options:

- Edit field
- Add new field
- Delete field
- Continue
```

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

## ⚙️ CLI Commands

### Create project

```bash
create-smart-api create my-api
```

### Or Use create-smart-api c my-api

```bash
create-smart-api c my-api
```

---

### Generate CRUD

```bash
create-smart-api generate:crud user
```

### Or Use create-smart-api g:c user

```bash
create-smart-api g:c user
```

---

### Generate Auth

```bash
create-smart-api generate:auth
```

### Or Use create-smart-api g:a

```bash
create-smart-api g:a
```

---

### Generate Service

```bash
create-smart-api generate:service
```

### Or Use create-smart-api g:s

```bash
create-smart-api g:s
```

---

### Generate Model

```bash
create-smart-api generate:model user
```

### Or Use create-smart-api g:m user

```bash
create-smart-api g:m user
```

---

### Generate Validation

```bash
create-smart-api generate:validation user
```

### Or Use create-smart-api g:v user

```bash
create-smart-api g:v user
```

---

### Generate Tests

```bash
create-smart-api generate:test user
```

### Or Use create-smart-api g:t user

```bash
create-smart-api g:t user
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

## 🔌 Plugin System

```bash
create-smart-api plugin install redis
```

---

## 🔗 Relationship Support

Define relationships between models using a simple and guided approach.

---

### 🔹 Add Relations

You will be prompted to define relationships:

```bash
Related model name: User
Relation type:
❯ 1:1
  1:N
  N:N

Add another relation? Yes/No

Model "User" not found.

? What do you want to do?
❯ Create Model
  Skip
```

---

## 🗺️ Roadmap

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
