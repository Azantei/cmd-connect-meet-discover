# C.M.D. — Connect. Meet. Discover.

A community events platform built with Node.js, Express, EJS, Sequelize, and MySQL.

## Team Setup (do this once per machine)

### 1. Pull the repo
```bash
git pull
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
The `.env` file is not committed to git. Create a new file called `.env` in the project root and fill it in:

```
DB_NAME=cmd_db
DB_USER=root
DB_PASS=your_mysql_root_password
DB_HOST=localhost
SESSION_SECRET=any_long_random_string_here
PORT=3000
```

### 4. Install MySQL (if you don't have it)
Download MySQL Installer, choose **Developer Default**, and set a root password during setup. Write it down — you'll need it for `DB_PASS` above.

### 5. Create the database
Open MySQL Workbench and run:
```sql
CREATE DATABASE cmd_db;
```

### 6. Start the server
```bash
node app.js
```

You should see:
```
Database synced.
C.M.D. running on http://localhost:3000
```

Sequelize will create all the tables automatically from the models — no migrations to run manually.

> **Note:** Your database starts empty. Go to [http://localhost:3000/register](http://localhost:3000/register) to create a test account before trying to log in.

---

## Project Structure

```
cmd-connect-meet-discover/
├── app.js                  Express app entry point
├── .env                    Local environment variables (not committed)
├── models/                 Sequelize models (User, Post, Event, etc.)
├── controllers/            Route handler logic
├── routes/                 Express routers
├── middleware/             Auth middleware (requireAuth, requireRole)
├── views/                  EJS templates
│   ├── auth/               login.ejs, register.ejs
│   ├── users/              profile.ejs, settings.ejs
│   ├── posts/              index.ejs, create.ejs, show.ejs
│   ├── events/             index.ejs, create.ejs, show.ejs
│   ├── moderator/          dashboard.ejs, reports.ejs
│   ├── admin/              dashboard.ejs, users.ejs, reports.ejs
│   └── partials/           header.ejs, footer.ejs
├── public/                 Static assets (CSS, client JS, images)
└── pages/                  Legacy static HTML mockups (not served by Express)
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Templating:** EJS
- **ORM:** Sequelize
- **Database:** MySQL
- **Auth:** express-session + bcrypt
- **Other:** connect-flash, method-override
