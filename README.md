# VU Student Portal

A full-stack web application for Virtual University of Pakistan students, featuring a React (Vite) frontend and Express.js backend with TypeScript. The portal provides authentication, resource sharing, discussions, and more.

## Features
- Secure authentication with OTP email verification
- Admin and student roles
- Password reset and email verification flows
- Resource upload, discussions, badges, and AI chat (coming soon)
- Responsive UI with dark/light mode

## Project Structure
```
VUAuthPortal/
├── client/           # React frontend (Vite, TypeScript, Tailwind CSS)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── routes.ts
│       └── ...
├── server/           # Express backend (TypeScript)
│   ├── index.ts
│   ├── routes.ts
│   ├── json_storage.ts
│   ├── mongodb.ts
│   └── ...
├── shared/           # Shared TypeScript types/schemas
├── .env              # Environment variables
├── package.json      # Project scripts and dependencies
└── README.md         # Project documentation
```

## Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd VuAuthPortal
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env` or `.sample.env` and fill in required values:
     - `PORT`, `SESSION_SECRET`, `ENCRYPTION_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, SMTP settings, etc.
   - **Generate a secure ENCRYPTION_KEY:**
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
     Add the output to your `.env` as `ENCRYPTION_KEY=...`
4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Environment Variables
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Session encryption secret
- `ENCRYPTION_KEY` - 32-byte Base64 string for AES encryption (required)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin credentials
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email settings
- `USE_MONGODB`, `MONGODB_URI` - (Optional) MongoDB connection
- `DATABASE_URL` - (Optional) PostgreSQL/Neon connection

## Future Improvements
- Connect and migrate to MongoDB or PostgreSQL for production
- Implement session handling and persistent login
- Add frontend forms for resource upload, discussions, and profile editing
- Integrate AI chat functionality
- Improve admin dashboard and moderation tools
- Add tests and CI/CD pipeline

## Next Steps
1. **Connect MongoDB or PostgreSQL** for scalable storage
2. **Implement session handling** for persistent authentication
3. **Build frontend forms** for uploading resources and discussions
4. **Enhance admin features** and moderation
5. **Add automated tests** for backend and frontend

---
For any issues or suggestions, please open an issue or contact the maintainers.