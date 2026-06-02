# Lore Vault Market - E-Commerce Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?logo=passport&logoColor=black)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/-rabbitmq-%23FF6600?style=flat&logo=rabbitmq&logoColor=white)

A robust and scalable e-commerce backend platform built with **NestJS**, designed to manage products, categories, user authentication, and real-time communication via WebSockets.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)

---

## ✨ Features

### Authentication Management
- **JWT (JSON Web Tokens)** for secure authentication
- **Passport Strategy** for user validation
- Password encryption with **bcrypt**
- Custom guards to protect routes

### Product Management
- Full CRUD operations for products
- Category and product types management
- Data validation with class decorators
- Pagination and filtering results

### File Upload
- Support for image and file uploads
- Secure server-side file handling
- Static file serving for public resource access

### Real-Time Communication
- **WebSockets** integration with Socket.io
- Messaging gateway for live events
- Bidirectional client-server communication

### API Documentation
- **Swagger/OpenAPI** integration
- Automatic endpoint documentation
- Interactive endpoint specification

### Database
- **PostgreSQL** as relational database
- **TypeORM** for entity management and migrations
- Data seeding for testing

### Testing
- Unit tests with **Jest**
- E2E tests for functionality validation
- Code coverage reporting

---

## 🛠️ Tech Stack

### Backend
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **TypeScript** - Typed superset of JavaScript

### Database & ORM
- **PostgreSQL** - Relational database
- **TypeORM** - ORM for Node.js

### Authentication & Security
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

### Real-Time Communication
- **Socket.io** - Bidirectional WebSocket communication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatter
- **Jest** - Testing framework
- **Swagger** - API documentation

### Containerization
- **Docker & Docker Compose** - Service containerization

---

## 🏗️ Architecture

The project follows **NestJS modular architecture**, organized into independent and reusable modules:

```
src/
├── auth/                    # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── decorators/          # Custom decorators
│   ├── dto/                 # Data Transfer Objects
│   ├── entities/            # Database entities
│   ├── guards/              # Route protection guards
│   ├── interfaces/          # TypeScript interfaces
│   └── strategies/          # Passport strategies
├── products/                # Products module
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── dto/
│   └── entities/
├── category/                # Categories module
│   ├── category.controller.ts
│   ├── category.service.ts
│   ├── dto/
│   └── entities/
├── product-types/           # Product types module
│   ├── product-types.controller.ts
│   ├── product-types.service.ts
│   ├── dto/
│   └── entities/
├── files/                   # File management module
│   ├── files.controller.ts
│   ├── files.service.ts
│   └── helpers/
├── messages-ws/             # WebSocket messaging gateway
│   ├── messages-ws.gateway.ts
│   ├── messages-ws.service.ts
│   └── dtos/
├── seed/                    # Data seeding module
│   ├── seed.service.ts
│   └── data/
├── common/                  # Shared module
│   ├── dtos/
│   └── common.module.ts
├── app.module.ts            # Root application module
└── main.ts                  # Application entry point

static/                       # Static files served
├── products/
└── uploads/
```

### Architecture Patterns

- **Controllers** → HTTP request handling
- **Services** → Business logic
- **Entities** → Database models (TypeORM)
- **DTOs** → Data validation and transformation
- **Guards** → Authentication and authorization middleware
- **Strategies** → Passport implementations
- **Decorators** → Reusable functionality

---

## 📦 Installation

### Prerequisites

- **Node.js** 17.x or higher
- **npm** or **yarn**
- **PostgreSQL** 14.3 or higher (or use Docker)
- **Docker & Docker Compose** (optional)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd e-commerce-backend
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lore_vault_market

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=3600

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_FOLDER=./static/uploads
```

### Step 4: Start Database with Docker (Optional)

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on the port specified in your `.env`.

### Step 5: Run Migrations

```bash
npm run typeorm migration:run
```

### Step 6: Seed Database (Optional)

```bash
npm run seed
```

---

## 🚀 Usage

### Development

Start the development server with watch mode:

```bash
npm run start:dev
```

The server will be available at `http://localhost:3000`

### API Documentation

Access the interactive Swagger documentation:

```
http://localhost:3000/api
```

### Testing

Run unit tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:cov
```

Run E2E tests:

```bash
npm run test:e2e
```

### Linting and Formatting

Check code with ESLint:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

### Build for Production

```bash
npm run build
npm run start:prod
```

---

## 🔐 Authentication

The application uses **JWT** for authentication. Protected endpoints require a token in the header:

```
Authorization: Bearer <your_jwt_token>
```

Obtain a token by authenticating with your credentials on the login endpoint.

---

## 🌐 WebSockets

The application includes real-time communication support via WebSockets. Connect to:

```
ws://localhost:3000/socket.io
```

Refer to the gateway documentation for available events.

---

## 📝 License

Unlicensed - Personal Project

---

## 👨‍💻 Author

Developed as a portfolio project to demonstrate proficiency in backend development with NestJS, modular architecture, and development best practices.

