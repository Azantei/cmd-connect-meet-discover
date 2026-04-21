# C.M.D. — Connect. Meet. Discover.

A community events and activities platform where users can create posts, RSVP to events, and connect with others. Built with Node.js, Express, EJS, Sequelize, and MySQL.

Three user roles are supported: **Community Member**, **Moderator**, and **System Administrator**.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MySQL](https://dev.mysql.com/downloads/installer/) 8.x (choose **Developer Default** during setup)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Configure Environment Variables

Create a file named `.env` in the project root. It is not committed to git — you must create it manually.

```
DB_NAME=cmd_db
DB_USER=root
DB_PASS=your_mysql_root_password
DB_HOST=localhost
SESSION_SECRET=any_long_random_string_here
PORT=3000
```

| Variable | Description |
|---|---|
| `DB_NAME` | Name of the MySQL database (create this in step 3) |
| `DB_USER` | MySQL username (default: `root`) |
| `DB_PASS` | MySQL password set during MySQL installation |
| `DB_HOST` | MySQL host (default: `localhost`) |
| `SESSION_SECRET` | Any long random string used to sign session cookies |
| `PORT` | Port the server listens on (default: `3000`) |

---

## 3. Create the Database

Open MySQL Workbench (or any MySQL client) and run:

```sql
CREATE DATABASE cmd_db;
```

> If a database dump is provided with this submission, restore it now:
> ```bash
> mysql -u root -p cmd_db < dump.sql
> ```
> If no dump is provided, skip this step — Sequelize will create all tables automatically on first run, and the database will start empty.

---

## 4. Start the Application

```bash
node app.js
```

You should see:

```
Database synced.
C.M.D. running on http://localhost:3000
```

Sequelize automatically creates all tables from the model definitions. No migrations need to be run manually.

---

## 5. First-Time Setup (Empty Database)

If you are starting from an empty database:

1. Go to [http://localhost:3000/register](http://localhost:3000/register) to create a community member account.
2. To create a **moderator** or **admin** account, register a normal account first, then manually update the `role` column in the `users` table:

```sql
UPDATE users SET role = 'moderator' WHERE email = 'your@email.com';
UPDATE users SET role = 'admin'     WHERE email = 'your@email.com';
```

3. Categories for posts must be seeded via the admin panel at `/admin/settings` before community members can tag their posts.

---

## Project Structure

```
cmd-connect-meet-discover/
├── app.js                  Express entry point — middleware, routes, DB sync
├── .env                    Local environment variables (not committed)
├── models/                 Sequelize models (User, Post, RSVP, Report, etc.)
├── controllers/            Request handlers — one file per feature area
├── routes/                 Express routers — one file per feature area
├── services/               Business logic layer (postService, adminService, etc.)
├── presenters/             Data shaping for views (adminPresenter, profilePresenter)
├── middleware/             Auth guards (requireAuth, requireRole), upload, viewLocals
├── utils/                  Shared helpers
├── views/                  EJS templates
│   ├── auth/               login.ejs, register.ejs, setup.ejs
│   ├── users/              profile.ejs, otherProfile.ejs, settings.ejs
│   ├── posts/              index.ejs, show.ejs, create.ejs, edit.ejs
│   ├── events/             index.ejs
│   ├── moderator/          dashboard.ejs, reports.ejs, history.ejs
│   ├── admin/              users.ejs, escalated.ejs, analytics.ejs, settings.ejs
│   └── partials/           Shared header, warning indicator, topbars
├── public/                 Served static assets
│   ├── css/                Per-page stylesheets
│   ├── js/                 Per-page client-side scripts
│   └── uploads/            User-uploaded images (profile pics, post images)
└── pages/                  Legacy static HTML mockups (not served by Express)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS |
| ORM | Sequelize |
| Database | MySQL |
| Authentication | express-session + bcrypt |
| File Uploads | multer |
| Flash Messages | connect-flash |
| Form Method Override | method-override |

---

## AI Usage Disclosure

This project was developed with the assistance of agentic AI tools:

- **Claude Code** (Anthropic) — used for implementation, debugging, and code review throughout development
- **GitHub Copilot with ChatGPT Codex** — used for code completion and suggestions during development

All AI-generated output was reviewed, tested, and owned by the development team. Every team member is expected to understand and be able to explain all parts of the codebase.
