# CV-Genix

A full-stack Resume Builder built with the MERN Stack — featuring ATS optimization, job recommendations, and market analytics.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Deployment:** Docker, Docker Compose, Nginx

## Features
- Resume Builder with real-time preview
- ATS Score Dashboard & Keyword Optimizer
- Job Recommendations & Skill Gap Analysis
- Market Analytics (salary trends, skill demand, heatmaps)
- Voice Input support
- JWT-based Authentication

## Run with Docker

```bash
git clone https://github.com/kumaran69/cv-genix.git
cd cv-genix
docker-compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |
| MongoDB  | localhost:27017       |

```bash
# Stop containers
docker-compose down

# Fix container conflicts
docker-compose down --remove-orphans
```

## Run Locally

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables

Create a `.env` in the `backend/` folder:

```env
MONGO_URI=mongodb://localhost:27017/cvgenix
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Author
**Kumaran** — [GitHub](https://github.com/kumaran69) · [LinkedIn](https://www.linkedin.com/in/kumaran-m-077135411/)