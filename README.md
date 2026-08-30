# 💰 SpendWise — Teen Financial Literacy App

A gamified personal finance app for teenagers featuring expense tracking, savings goals, impulse-control tools, financial quizzes, and multi-role support (Admin / Parent / Teen).

## 🚀 Live Deployment Stack

| Layer | Service |
|---|---|
| Frontend + API | [Vercel](https://vercel.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Source Control | [GitHub](https://github.com) |

---

## 🛠️ Local Development

### Prerequisites
- Python 3.9+
- `pip install psycopg2-binary`

### Run Locally (original Python server)
```bash
cd "spendwise app"
python server.py
# Open http://localhost:8000
```

---

## 🚢 Deploying to Production

### Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Go to **SQL Editor** → **New Query**
3. Paste and run the entire contents of [`supabase_schema.sql`](./supabase_schema.sql)
4. Verify tables in **Table Editor**: `users`, `expenses`, `goals`, `challenges`, `quizzes`, `should_i_buy`, `user_badges`, `user_quiz_attempts`
5. Copy your **Database URL**:  
   `Project Settings → Database → Connection string → URI`  
   Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

---

### Step 2 — Push to GitHub

```bash
cd "/Users/sanju/Desktop/spendwise app"
git init
git add .
git commit -m "feat: initial SpendWise app with Vercel + Supabase deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendwise-app.git
git push -u origin main
```

---

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. In **Environment Variables**, add:
   - **Name**: `DATABASE_URL`
   - **Value**: your Supabase connection string from Step 1
4. Click **Deploy** ✅

---

## 👤 Default Login Credentials

| Role | Username | Password |
|---|---|---|
| 👑 Admin | `Arainnaa` | `Arainnaa123` |
| 🛡️ Parent | `sarah` | `sarah123` |
| 🎯 Teen (Siya) | `siya` | `siya123` |
| 🚀 Teen (Sam) | `sam` | `sam123` |

---

## 📁 Project Structure

```
spendwise app/
├── index.html          # Main app UI (single-page app)
├── style.css           # All styles
├── app.js              # Frontend logic + localStorage fallback
├── api/
│   └── index.py        # Vercel Python serverless function (all /api/* routes)
├── vercel.json         # Vercel routing configuration
├── requirements.txt    # Python dependencies (psycopg2-binary)
├── supabase_schema.sql # DB schema + seed data for Supabase
├── .env.example        # Environment variable template
└── .gitignore
```

---

## 🔑 Features

- **Multi-role authentication** — Admin, Parent, Teen
- **Expense tracking** with categories and balance auto-update
- **Savings goals** with deposit progress tracking
- **Should I Buy This?** — 48-hour impulse control cool-off timer
- **MoneyQuest** — 10,000-level financial literacy quiz engine
- **Challenges & Badges** — gamified XP rewards
- **Admin dashboard** — user management, role changes, quiz creation
- **Parent dashboard** — allowance top-up, teen monitoring
