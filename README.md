# 🚀 create-smart-api

### Smart Node.js Backend Generator for Production-Ready APIs

Build scalable backend APIs in seconds with an interactive CLI that generates clean, production-ready Node.js projects using Express or Fastify.

---

## 📦 Overview

`create-smart-api` is a powerful CLI toolkit that helps developers scaffold modern backend applications with:

- Clean architecture
- CRUD generation
- Authentication
- Validation
- Swagger docs
- Testing setup
- Plugin support
- Interactive schema builder

Perfect for rapid backend development.

---

## ✨ Key Highlights

### 🔥 Smart Interactive CLI

Generate complete backend projects with guided prompts.

### 🧠 Interactive Schema Builder

Create models visually with:

- Add/Edit/Delete fields
- Bulk field input mode
- Table preview before generation
- Auto typo correction for field types

### ⚡ Production Ready

Generated projects include:

- Folder structure
- Database config
- Environment setup
- Real connected CRUD APIs

---

# 🎯 Features

- ✅ Express.js / Fastify support
- ✅ CommonJS + ESM support
- ✅ MongoDB / MySQL / MSSQL support
- ✅ Sequelize + Mongoose support
- ✅ CRUD generator
- ✅ Auth generator
- ✅ Validation generator
- ✅ Swagger/OpenAPI setup
- ✅ Jest testing support
- ✅ Plugin system
- ✅ Microservice scaffolding

---

# 📥 Installation

## Run instantly with npx

```bash
npx create-smart-api create my-api
```

## Short alias

```bash
npx create-smart-api c my-api
```

## Global install

```bash
npm install -g create-smart-api
```

---

# ⚡ Quick Start

```bash
create-smart-api create my-api
```

or

```bash
create-smart-api c my-api
```

---

# 🏗️ Project Setup Wizard

The CLI will guide you through:

- Project name
- Framework selection
- Module system
- Database choice
- CRUD generation
- Port configuration

Supported databases:

- MongoDB
- MySQL
- MSSQL

---

# 🧠 Smart CRUD Generator

Generate complete CRUD module instantly:

```bash
create-smart-api generate:crud user
```

or shortcut:

```bash
create-smart-api g:c user
```

---

## Schema Builder Example

### Interactive Mode

```bash
Field name: name
Type: string
Required? Yes
Unique? No
```

---

### Quick Input Mode

```bash
name:string,email:string,age:number,status:enum
```

---

## Schema Preview Table

```bash
| # | Field  | Type   | Req | Uniq | Default | Extra              |
|---|--------|--------|-----|------|---------|--------------------|
| 1 | name   | string | Yes | No   | -       | -                  |
| 2 | email  | string | Yes | Yes  | -       | -                  |
| 3 | status | enum   | No  | No   | active  | active,inactive    |
```

---

## Edit Before Generate

Options include:

- Edit field
- Add field
- Delete field
- Continue

---

# ⚙️ CLI Commands

---

## Create Project

```bash
create-smart-api create my-api
create-smart-api c my-api
```

---

## Generate CRUD

```bash
create-smart-api generate:crud user
create-smart-api g:c user
```

---

## Generate Auth

```bash
create-smart-api generate:auth
create-smart-api g:a
```

---

## Generate Service

```bash
create-smart-api generate:service user
create-smart-api g:s user
```

---

## Generate Route

```bash
create-smart-api generate:route user
create-smart-api g:r user
```

---

## Generate Model

```bash
create-smart-api generate:model user
create-smart-api g:m user
```

---

## Generate Validation

```bash
create-smart-api generate:validation user
create-smart-api g:v user
```

---

## Generate Test

```bash
create-smart-api generate:test user
create-smart-api g:t user
```

---

## Generate Swagger

```bash
create-smart-api generate:swagger
```

---

## Add Plugin

```bash
create-smart-api add:plugin redis
create-smart-api add:p redis
```

---

# 🔌 Plugin Support

Currently supported plugins:

- Redis
- Kafka

Example:

```bash
create-smart-api add:plugin kafka
```

---

# 🧩 Database Support

---

## MongoDB (Mongoose)

- Schema models
- Enum support
- Defaults
- Validation ready

---

## MySQL / MSSQL (Sequelize)

- Typed models
- Constraints
- Auto mappings

---

# 🔗 Relationship Support

Define model relationships interactively:

```bash
Related model name: User
Relation type:
❯ 1:1
  1:N
  N:N
```

Auto-create missing related models if needed.

---

# 🧪 Testing

Generated apps support Jest:

```bash
npm test
```

---

# 🛠️ Auto Command Suggestions

Mistyped command?

Example:

```bash
create-smart-api genrate:crud user
```

CLI automatically suggests:

```bash
Did you mean: generate:crud ?
```

And can rerun automatically after confirmation.

---

# 🚀 Roadmap

Upcoming features:

- GraphQL generator
- Redis cache layer
- Advanced microservices templates
- AI-powered API generation
- Docker support
- CI/CD templates

---

# 🤝 Contributing

Contributions are welcome!

1. Fork repository
2. Create feature branch
3. Commit changes
4. Submit PR

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Created with ❤️ by **Chirag Chauhan**

GitHub:
https://github.com/cvchauhan

---

# ⭐ Support

If you like this project:

👉 Star the repository  
👉 Share with developers  
👉 Contribute ideas

---

### Build APIs Faster. Smarter. Cleaner.

```bash
npx create-smart-api create my-next-api
```
