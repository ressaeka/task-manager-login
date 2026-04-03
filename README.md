# Task manager API

## Deskripsi

Task Manager API adalah backend RESTful API untuk aplikasi manajemen task (todo list) 
dengan sistem authentication dan authorization berbasis role (User & Admin). 
Dibangun menggunakan **Node.js, Express, dan PostgreSQL** dengan arsitektur MVC 
yang bersih dan scalable.

## Fitur

- Register & Login user
- Password hashing dengan bcrypt
- CRUD tasks
- Testing dengan jest & superjest
- authentication JWT (Coming soon)

## Tech Stack

- Node.js
- Express
- PostgreSQL (Coming soon)
- jest

## Cara Menjalankan

- Clone Repo
- Install dependencies - npm install
- Jalankan server - npm run start

### Auth Users

- POST /Auth/register
- POST /Auth/login
- POST /Auth/logout

## tasks

- GET /tasks
- POST /tasks
- PUT /tasks/:id
- DELETE tasks/:id

## Testing

Jalankan : npm test / npx test
