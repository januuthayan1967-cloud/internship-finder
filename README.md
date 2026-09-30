# Internship Finder

A modern, full-stack web platform connecting ambitious students with forward-thinking companies for internship opportunities, interviews, and talent discovery.

---

## Overview

**Internship Finder** streamlines the tech internship search and recruitment workflow:
- **Students** can build rich professional profiles, upload CVs, discover curated internship openings, submit applications, and participate in scheduled interviews.
- **Companies** can post vacancies, search talent filtered by programming languages and domains, schedule and manage video interviews, and review applicant details.
- **Administrators** maintain platform integrity by reviewing and approving company registrations, monitoring internship postings, and managing interview schedules.

---

## Key Features

- **Role-Based Authentication**: Dedicated flows and dashboards for Students, Companies, and Admins.
- **Interactive Internship Board**: Real-time filtering by tech stack, domain, stipend, and duration.
- **Dark Mode Support**: Persistent, zero-flicker Light and Dark mode toggle across the entire application with smooth micro-interactions.
- **Animated & Responsive UI**: Built with Tailwind CSS and Framer Motion for responsive layouts across desktop, tablet, and mobile devices.
- **Interview Scheduling & Video Calling**: Schedule multi-round interviews with integrated video room links.
- **Profile & Resume Management**: Complete profile onboarding with CV file uploads and previewing.

---

## Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - Framer Motion
  - Lucide React Icons
  - React Hot Toast
  - React Router DOM v7
  - Axios

- **Backend**:
  - Node.js & Express
  - MongoDB & Mongoose
  - JSON Web Tokens (JWT) & bcryptjs
  - Multer (File & CV uploads)
  - CORS & Dotenv

---

## Project Structure

```text
internship-finder/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components & navigation
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── pages/              # Role-based pages (Student, Company, Admin)
│   │   ├── App.jsx             # Main application router
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML shell with theme pre-hydration
│   ├── tailwind.config.js      # Tailwind design system configuration
│   ├── vite.config.js          # Vite configuration & API proxy setup
│   └── package.json            # Frontend dependencies
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # Database configuration (MongoDB)
│   ├── middleware/             # Auth & role verification middleware
│   ├── models/                 # Mongoose schemas (User, Student, Company, Internship, etc.)
│   ├── routes/                 # Express API routes
│   ├── uploads/                # User uploaded CVs and profile pictures
│   ├── .env.example            # Environment variables template
│   ├── server.js               # Express application entry point
│   └── package.json            # Backend dependencies
├── render.yaml                 # Deployment configuration (Render)
├── package.json                # Root package for concurrently running dev server
├── .gitignore                  # Git exclusion rules
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/januuthayan1967-cloud/internship-finder.git
   cd internship-finder
   ```

2. **Install all dependencies**:
   Install root dependencies:
   ```bash
   npm install
   ```

   Install frontend and backend dependencies:
   ```bash
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

---

### Environment Configuration

Configure the backend environment variables before starting the server.

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create a `.env` file based on the provided template:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your actual configuration:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   REACT_APP_ZEGO_APP_ID=your_zego_app_id
   ZEGO_SERVER_SECRET=your_zego_server_secret
   ```

---

### Running the Application

You can start both frontend and backend concurrently with a single command from the project root:

```bash
npm run dev
```

Alternatively, you can run client and server independently:

- **Frontend only**:
  ```bash
  npm run client
  ```
  Runs at: [http://localhost:5173](http://localhost:5173)

- **Backend API only**:
  ```bash
  npm run server
  ```
  Runs at: [http://localhost:5000](http://localhost:5000)

---

## Default Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React application with Vite proxy |
| **Backend REST API** | `http://localhost:5000/api` | Express API endpoints |
| **Health Check** | `http://localhost:5000/` | API status verification |

---

## Security & Best Practices

- Never commit real `.env` files or credentials to Git.
- Ensure `JWT_SECRET` is set to a secure, randomly generated string in production.
- Use MongoDB Atlas network access allowlists to restrict access to trusted IPs in production.

---

## License

This project is licensed under the MIT License.
