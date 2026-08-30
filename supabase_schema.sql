-- ============================================================
-- SpendWise — Supabase PostgreSQL Schema & Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'teen',
    username TEXT,
    password TEXT,
    pocket_money REAL DEFAULT 4000,
    balance REAL DEFAULT 2450,
    points INTEGER DEFAULT 350,
    level INTEGER DEFAULT 2,
    streak INTEGER DEFAULT 4,
    avatar TEXT DEFAULT '⚡',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    category TEXT DEFAULT 'Tech',
    icon TEXT DEFAULT '🎧',
    deadline TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS should_i_buy (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    item_name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    is_need INTEGER DEFAULT 0,
    usage_freq TEXT NOT NULL,
    decision TEXT DEFAULT 'cooldown',
    cooldown_until TIMESTAMP,
    status TEXT DEFAULT 'pending',
    reflection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'saving',
    points_reward INTEGER DEFAULT 100,
    target_val INTEGER DEFAULT 1,
    progress_val INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'smart_shopping',
    scenario TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    points_reward INTEGER DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    badge_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    quiz_id INTEGER NOT NULL,
    selected_option INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- ────────────────────────────────────────────────────────────
-- SEED DATA — Default Multi-Role Accounts
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, name, role, username, password, pocket_money, balance, points, level, streak, avatar)
VALUES
    (1, 'Arainnaa', 'admin', 'Arainnaa', 'Arainnaa123', 10000.0, 10000.0, 1200, 5, 12, '👑'),
    (2, 'Parent Sarah', 'parent', 'sarah', 'sarah123', 8000.0, 8000.0, 850, 4, 8, '🛡️'),
    (3, 'Siya', 'teen', 'siya', 'siya123', 4000.0, 2250.0, 420, 2, 4, '🎯'),
    (4, 'Sam', 'teen', 'sam', 'sam123', 3000.0, 1800.0, 250, 1, 2, '🚀')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence after manual ID inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ────────────────────────────────────────────────────────────
-- SEED — Default Expenses
-- ────────────────────────────────────────────────────────────

INSERT INTO expenses (user_id, title, amount, category, date, description)
VALUES
    (3, 'School Canteen Lunch', 120.0, 'Food', '2026-08-28', 'Daily lunch'),
    (3, 'Bus Pass Recharge', 200.0, 'Transport', '2026-08-25', 'Monthly bus pass'),
    (3, 'Sketch Pens Set', 180.0, 'Education', '2026-08-22', 'Art project supplies'),
    (3, 'Weekend Movie Ticket', 250.0, 'Entertainment', '2026-08-18', 'With friends'),
    (4, 'Tuck Shop Snacks', 80.0, 'Food', '2026-08-28', 'Evening snacks'),
    (4, 'Notebook Bundle', 150.0, 'Education', '2026-08-24', 'New semester notebooks')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SEED — Default Goals
-- ────────────────────────────────────────────────────────────

INSERT INTO goals (user_id, title, target_amount, current_amount, category, icon, deadline, status)
VALUES
    (3, 'Wireless Headphones', 1299.0, 450.0, 'Tech', '🎧', '2026-09-30', 'active'),
    (3, 'Birthday Gift for Mom', 500.0, 200.0, 'Gift', '🎁', '2026-09-15', 'active'),
    (4, 'New Cricket Bat', 800.0, 300.0, 'Sports', '🏏', '2026-10-01', 'active')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SEED — Default Challenges
-- ────────────────────────────────────────────────────────────

INSERT INTO challenges (title, description, category, points_reward, target_val, progress_val, is_completed)
VALUES
    ('No-Spend Weekend', 'Avoid ALL non-essential spending for one full weekend!', 'saving', 200, 1, 0, FALSE),
    ('50/30/20 Budget Master', 'Split your pocket money: 50% needs, 30% wants, 20% savings for a full month.', 'budgeting', 300, 1, 0, FALSE),
    ('Log 10 Expenses', 'Accurately track 10 expenses in SpendWise this month.', 'tracking', 150, 10, 6, FALSE),
    ('Complete 5 Daily Quizzes', 'Answer 5 financial literacy quiz questions correctly in a row.', 'quiz', 250, 5, 3, FALSE),
    ('48-Hour Cool-off Hero', 'Use the Should-I-Buy tool 3 times before making a purchase decision.', 'impulse', 180, 3, 1, FALSE)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SEED — Default Quizzes (4 hand-crafted levels)
-- ────────────────────────────────────────────────────────────

INSERT INTO quizzes (title, category, scenario, option_a, option_b, option_c, option_d, correct_option, explanation, points_reward)
VALUES
    (
        'Level 1: The Impulse Headphones Trap', 'smart_shopping',
        'Siya has ₹4,000 monthly pocket money. On Day 5, she sees cool wireless headphones for ₹1,299. What is the smartest move?',
        'Buy them instantly with her balance.',
        'Put them on a 48-hour cool-off period & create a savings goal.',
        'Borrow money from a friend.',
        'Spend all money on small snacks instead.',
        2, 'The 48-hour rule prevents impulse buys! Delaying gratification gives your brain time to evaluate.', 60
    ),
    (
        'Level 2: Need vs. Want Challenge', 'budgeting',
        'You forgot your lunch box at home. Buying a canteen meal costs ₹80. A designer water bottle costs ₹450. Which is a core NEED?',
        'The designer water bottle.',
        'Neither, stay hungry.',
        'The ₹80 canteen lunch for nutrition.',
        'Buying 5 candy bars.',
        3, 'A NEED is necessary for daily well-being and health (like lunch). A WANT is an optional upgrade.', 50
    ),
    (
        'Level 3: The 50/30/20 Rule for Teenagers', 'saving_basics',
        'If you receive ₹4,000 pocket money, what does the teen saving rule suggest for your 20% savings portion?',
        'Save ₹800 (20%) immediately before spending on wants!',
        'Spend ₹4,000 completely and save leftover coins.',
        'Give ₹4,000 to a friend.',
        'Save 100% and never go out.',
        1, 'Paying yourself FIRST guarantees achieving long-term goals effortlessly!', 70
    ),
    (
        'Level 4: Compound Interest Magic', 'saving_basics',
        'Siya saves ₹500 per month in a piggy bank for 1 year (no interest). Sam saves ₹500/month in a bank account with 5% annual interest. After 1 year, who has more money?',
        'Siya — both save the same amount.',
        'Sam — bank interest adds extra money on top of savings.',
        'Siya — banks charge fees that reduce savings.',
        'Both have exactly the same amount.',
        2, 'Compound interest grows your savings automatically. Even small interest rates make a big difference over time!', 80
    )
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SEED — Default Badges for Arainnaa
-- ────────────────────────────────────────────────────────────

INSERT INTO user_badges (user_id, badge_key, title, icon, description)
VALUES
    (1, 'impulse_slayer', 'Impulse Slayer', '🛡️', 'Completed your first 48-hour purchase pause reflection!'),
    (1, 'budget_rookie', 'Smart Saver', '🌱', 'Created your very first savings goal in SpendWise!'),
    (1, 'quiz_whiz', 'Quiz Master', '🧠', 'Answered 3 daily financial quizzes correctly!')
ON CONFLICT (badge_key) DO NOTHING;
