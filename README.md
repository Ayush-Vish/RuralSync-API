
# RuralSync API

A comprehensive microservices-based platform that connects customers seeking services with service providers and their agents. The system facilitates service booking, management, and delivery through a distributed architecture.

## Overview

RuralSync API is a service marketplace platform designed to bridge the gap between customers needing services and service providers who can deliver them through their agents. The system supports three primary user roles:

- **CLIENT**: Customers seeking services (book services, manage bookings, write reviews)
- **SERVICE_PROVIDER**: Business owners offering services (manage organization, add services, assign agents)  
- **AGENT**: Service technicians delivering services (handle assigned bookings, update status, manage tasks)

## Architecture

The system follows a microservices architecture with six core services orchestrated through an nginx API gateway [1](#0-0) .

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **nginx** | 80 | API Gateway and request routing |
| **auth** | 5001 | JWT Authentication |
| **customer** | 5002 | Client operations and booking management |
| **shopkeeper** | 5003 | Service provider management |
| **agent** | 5000 | Agent task management |
| **email-service** | 5005 | Email notifications |
| **audit-log** | 5006 | Activity tracking and logging |

## Technology Stack

- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Message Queue**: BullMQ + Redis
- **Authentication**: JWT + bcrypt
- **File Storage**: AWS S3
- **Email Service**: nodemailer
- **API Gateway**: nginx
- **Containerization**: Docker + docker-compose

## Customer Service API

The Customer Service is the core microservice handling all client-facing operations [2](#0-1) .

### Key Features

#### Booking Management
- Create authenticated and public bookings [3](#0-2) 
- Support for multiple services per booking
- Extra tasks and location data support [4](#0-3) 
- Booking status tracking and management

#### Service Discovery
- Browse available services and providers [5](#0-4) 
- Service search and filtering capabilities
- Provider information with ratings and reviews

#### Review System
- Rate and review service providers [6](#0-5) 
- Automatic average rating calculations
- Duplicate review prevention

### API Endpoints

#### Booking Endpoints
```
POST   /client/booking/book              - Create authenticated booking
POST   /client/booking/book2             - Create public booking  
GET    /client/booking/bookings          - Get customer bookings
GET    /client/booking/services          - Get all services
DELETE /client/booking/bookings/:id      - Cancel booking
```

#### Profile Endpoints
```
GET    /client/customers/profile         - Get customer profile
PUT    /client/customers/profile-update  - Update profile
PATCH  /client/customers/password        - Change password
```

#### Review Endpoints
```
POST   /client/reviews                   - Create review
PUT    /client/reviews/:reviewId         - Update review
DELETE /client/reviews/:reviewId         - Delete review
GET    /client/customers/reviews         - Get customer reviews
```

## Data Models

### Booking Model
The booking model represents service requests with comprehensive tracking [7](#0-6) :

- Client and service provider references
- Booking date/time scheduling
- Status tracking (`"Not Assigned"`, `"Pending"`, `"In Progress"`, `"Completed"`)
- Payment status (`"Paid"`, `"Unpaid"`)
- Extra tasks with pricing
- GeoJSON location support
- Agent assignment

## Authentication & Authorization

The system implements role-based authentication using JWT tokens [8](#0-7) :

- Role-specific token validation (`CLIENT`, `SERVICE_PROVIDER`, `AGENT`)
- Cookie and Authorization header support
- User context injection for protected routes

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB
- Redis

### Installation

1. Clone the repository
```bash
git clone https://github.com/Ayush-Vish/RuralSync-API.git
cd RuralSync-API
```

2. Install dependencies
```bash
npm install
```

3. Start services with Docker
```bash
docker-compose up
```

4. The API gateway will be available at `http://localhost:80`

### Environment Variables

Configure the following environment variables:
- `CUSTOMER_PORT`: Customer service port (default: 5002)
- `NODE_ENV`: Environment mode
- Database connection strings
- JWT secrets
- AWS S3 credentials

## Development

The project uses Nx workspace for monorepo management. Each service can be developed and deployed independently while sharing common utilities and database models.

### Project Structure
```
├── customer/           # Customer service
├── shopkeeper/         # Service provider service  
├── agent/             # Agent service
├── auth/              # Authentication service
├── email-service/     # Email notification service
├── audit-log/         # Audit logging service
├── api-gateway/       # nginx configuration
├── db/                # Shared database models
└── utils/             # Shared utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
