import json
import os
import datetime
import psycopg2
import psycopg2.extras
from urllib.parse import parse_qs, urlparse

# ────────────────────────────────────────────────────────────────────────────
# Database Connection
# ────────────────────────────────────────────────────────────────────────────

def get_db():
    """Create a PostgreSQL connection using the DATABASE_URL environment variable."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    conn = psycopg2.connect(database_url, cursor_factory=psycopg2.extras.RealDictCursor)
    return conn


# ────────────────────────────────────────────────────────────────────────────
# Helper Utilities
# ────────────────────────────────────────────────────────────────────────────

def safe_float(val, default=0.0):
    if val is None:
        return float(default)
    try:
        return float(val)
    except (ValueError, TypeError):
        return float(default)


def safe_int(val, default=0):
    if val is None:
        return int(default)
    try:
        return int(val)
    except (ValueError, TypeError):
        return int(default)


def json_response(data, status=200):
    """Return a Vercel-compatible HTTP response dict."""
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(data, default=str),
    }


def parse_body(request):
    """Parse JSON body from Vercel request."""
    body = request.get("body", "")
    if not body:
        return {}
    try:
        if isinstance(body, str):
            return json.loads(body)
        return body
    except (json.JSONDecodeError, TypeError):
        return {}


# ────────────────────────────────────────────────────────────────────────────
# Main Vercel Handler
# ────────────────────────────────────────────────────────────────────────────

def handler(request, context):
    """
    Entry point for Vercel Python Serverless Function.
    Handles all /api/* routes for SpendWise.
    """
    method = request.get("method", "GET").upper()

    # Handle CORS preflight
    if method == "OPTIONS":
        return json_response({}, 200)

    parsed = urlparse(request.get("url", "/"))
    path = parsed.path
    query = parse_qs(parsed.query)
    user_id = safe_int(query.get("user_id", [1])[0], 1)

    # ── GET Routes ─────────────────────────────────────────────────────────
    if method == "GET":
        conn = get_db()
        cursor = conn.cursor()
        try:
            # GET /api/users
            if path == "/api/users":
                cursor.execute("SELECT * FROM users ORDER BY id ASC")
                users = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "users": users})

            # GET /api/user
            elif path == "/api/user":
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("SELECT * FROM users ORDER BY id ASC LIMIT 1")
                    row = cursor.fetchone()
                user = dict(row)
                cursor.execute("SELECT * FROM user_badges WHERE user_id = %s", (user["id"],))
                user["badges"] = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "user": user})

            # GET /api/expenses
            elif path == "/api/expenses":
                cursor.execute(
                    "SELECT * FROM expenses WHERE user_id = %s ORDER BY date DESC, id DESC",
                    (user_id,)
                )
                expenses = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "expenses": expenses})

            # GET /api/goals
            elif path == "/api/goals":
                cursor.execute(
                    "SELECT * FROM goals WHERE user_id = %s ORDER BY id DESC",
                    (user_id,)
                )
                goals = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "goals": goals})

            # GET /api/should-i-buy
            elif path == "/api/should-i-buy":
                cursor.execute(
                    "SELECT * FROM should_i_buy WHERE user_id = %s ORDER BY id DESC",
                    (user_id,)
                )
                items = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "items": items})

            # GET /api/challenges
            elif path == "/api/challenges":
                cursor.execute("SELECT * FROM challenges ORDER BY id ASC")
                challenges = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "challenges": challenges})

            # GET /api/quizzes
            elif path == "/api/quizzes":
                cursor.execute("SELECT * FROM quizzes ORDER BY id ASC")
                quizzes = [dict(r) for r in cursor.fetchall()]
                cursor.execute(
                    "SELECT quiz_id, is_correct FROM user_quiz_attempts WHERE user_id = %s",
                    (user_id,)
                )
                attempts = {r["quiz_id"]: r["is_correct"] for r in cursor.fetchall()}
                for q in quizzes:
                    q["attempted"] = q["id"] in attempts
                    q["is_correct"] = attempts.get(q["id"])
                return json_response({"success": True, "quizzes": quizzes})

            # GET /api/stats
            elif path == "/api/stats":
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("SELECT * FROM users ORDER BY id ASC LIMIT 1")
                    row = cursor.fetchone()
                user = dict(row)

                cursor.execute(
                    "SELECT COALESCE(SUM(amount), 0) as total_spent FROM expenses WHERE user_id = %s",
                    (user["id"],)
                )
                total_spent = float(cursor.fetchone()["total_spent"] or 0)

                cursor.execute(
                    "SELECT COUNT(*) as total_goals FROM goals WHERE user_id = %s AND status = 'active'",
                    (user["id"],)
                )
                active_goals = cursor.fetchone()["total_goals"]

                cursor.execute(
                    "SELECT COUNT(*) as pending_cooldowns FROM should_i_buy WHERE user_id = %s AND status = 'pending'",
                    (user["id"],)
                )
                pending_cooldowns = cursor.fetchone()["pending_cooldowns"]

                return json_response({
                    "success": True,
                    "stats": {
                        "balance": user["balance"],
                        "pocket_money": user["pocket_money"],
                        "spent_total": total_spent,
                        "spent_percent": min(100, round((total_spent / max(1, user["pocket_money"])) * 100, 1)),
                        "points": user["points"],
                        "level": user["level"],
                        "streak": user["streak"],
                        "active_goals": active_goals,
                        "pending_cooldowns": pending_cooldowns,
                    }
                })

            # GET /api/admin/all-data
            elif path == "/api/admin/all-data":
                cursor.execute("SELECT * FROM users ORDER BY id ASC")
                users = [dict(r) for r in cursor.fetchall()]

                cursor.execute("""
                    SELECT expenses.*, users.name as user_name
                    FROM expenses
                    JOIN users ON expenses.user_id = users.id
                    ORDER BY expenses.date DESC, expenses.id DESC
                """)
                all_expenses = [dict(r) for r in cursor.fetchall()]

                cursor.execute("SELECT COUNT(*) as cnt FROM quizzes")
                custom_count = cursor.fetchone()["cnt"]
                quiz_count = 10000 + max(0, custom_count - 4)

                cursor.execute("SELECT COUNT(*) as cnt FROM goals")
                goal_count = cursor.fetchone()["cnt"]

                return json_response({
                    "success": True,
                    "users": users,
                    "expenses": all_expenses,
                    "quiz_count": quiz_count,
                    "goal_count": goal_count,
                })

            else:
                return json_response({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    # ── POST Routes ────────────────────────────────────────────────────────
    elif method == "POST":
        body = parse_body(request)
        conn = get_db()
        cursor = conn.cursor()

        try:
            # POST /api/register
            if path == "/api/register":
                name = str(body.get("name", "User")).strip() or "User"
                role = str(body.get("role", "teen")).strip().lower() or "teen"
                username = str(body.get("username", "")).strip()
                password = str(body.get("password", "")).strip()
                pocket_money = safe_float(body.get("pocket_money"), 4000.0)
                avatar = str(body.get("avatar", "🎯")).strip() or "🎯"

                if role == "admin":
                    if username.lower() != "arainnaa" or password != "Arainnaa123":
                        return json_response({
                            "success": False,
                            "message": 'Invalid Admin Credentials! Username must be "Arainnaa" and Password must be "Arainnaa123".'
                        }, 401)
                    name = "Arainnaa"

                cursor.execute("""
                    INSERT INTO users (name, role, username, password, pocket_money, balance, points, level, streak, avatar)
                    VALUES (%s, %s, %s, %s, %s, %s, 0, 1, 1, %s)
                    RETURNING id
                """, (name, role, username if username else name.lower(), password, pocket_money, pocket_money, avatar))
                user_id_new = cursor.fetchone()["id"]
                conn.commit()

                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id_new,))
                user = dict(cursor.fetchone())
                user["badges"] = []
                return json_response({"success": True, "user": user, "message": f"Account created for {name} ({role.capitalize()})! 🎉"})

            # POST /api/login
            elif path == "/api/login":
                username = str(body.get("username", "")).strip()
                password = str(body.get("password", "")).strip()
                raw_user_id = body.get("user_id")

                row = None
                if username or password:
                    cursor.execute("""
                        SELECT * FROM users
                        WHERE (LOWER(username) = LOWER(%s) OR (role = 'admin' AND LOWER(%s) = 'arainnaa'))
                          AND password = %s
                    """, (username, username, password))
                    row = cursor.fetchone()
                    if not row:
                        return json_response({"success": False, "message": "Invalid Username or Password! Access denied."}, 401)
                elif raw_user_id is not None:
                    uid = safe_int(raw_user_id, 1)
                    cursor.execute("SELECT * FROM users WHERE id = %s", (uid,))
                    row = cursor.fetchone()
                    if not row:
                        return json_response({"success": False, "message": "User profile not found!"}, 404)
                    temp_user = dict(row)
                    if temp_user.get("role") == "admin":
                        req_u = str(body.get("username", "")).strip()
                        req_p = str(body.get("password", "")).strip()
                        if req_u.lower() != "arainnaa" or req_p != "Arainnaa123":
                            return json_response({"success": False, "message": "Admin authentication required! Username: Arainnaa and Password: Arainnaa123 required."}, 401)
                else:
                    return json_response({"success": False, "message": "Username and password required to sign in!"}, 400)

                user = dict(row)
                cursor.execute("SELECT * FROM user_badges WHERE user_id = %s", (user["id"],))
                user["badges"] = [dict(r) for r in cursor.fetchall()]
                return json_response({"success": True, "user": user, "message": f'Logged in as {user["name"]}!'})

            # POST /api/user/update
            elif path == "/api/user/update":
                uid = safe_int(body.get("user_id"), 1)
                name = body.get("name")
                pocket_money = safe_float(body.get("pocket_money"), 4000)

                cursor.execute("SELECT balance, pocket_money FROM users WHERE id = %s", (uid,))
                curr = cursor.fetchone()
                diff = pocket_money - curr["pocket_money"]
                new_balance = max(0, curr["balance"] + diff)

                cursor.execute("""
                    UPDATE users SET name = %s, pocket_money = %s, balance = %s WHERE id = %s
                """, (name, pocket_money, new_balance, uid))
                conn.commit()
                return json_response({"success": True, "message": "Profile updated successfully!"})

            # POST /api/expenses
            elif path == "/api/expenses":
                uid = safe_int(body.get("user_id"), 1)
                title = body.get("title")
                amount = safe_float(body.get("amount"), 0)
                category = body.get("category", "Other")
                date = body.get("date", datetime.date.today().isoformat())
                description = body.get("description", "")

                cursor.execute("""
                    INSERT INTO expenses (user_id, title, amount, category, date, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (uid, title, amount, category, date, description))
                cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (amount, uid))
                cursor.execute("UPDATE users SET points = points + 10 WHERE id = %s", (uid,))
                conn.commit()
                return json_response({"success": True, "message": "Expense recorded! +10 XP earned for tracking."})

            # POST /api/expenses/delete
            elif path == "/api/expenses/delete":
                exp_id = safe_int(body.get("id"), 0)
                uid = safe_int(body.get("user_id"), 1)

                cursor.execute("SELECT amount FROM expenses WHERE id = %s AND user_id = %s", (exp_id, uid))
                exp = cursor.fetchone()
                if exp:
                    amount = exp["amount"]
                    cursor.execute("DELETE FROM expenses WHERE id = %s AND user_id = %s", (exp_id, uid))
                    cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (amount, uid))
                    conn.commit()
                    return json_response({"success": True, "message": f"Expense deleted and ₹{amount} refunded to balance."})
                else:
                    return json_response({"success": False, "message": "Expense not found."}, 404)

            # POST /api/goals
            elif path == "/api/goals":
                uid = safe_int(body.get("user_id"), 1)
                title = body.get("title")
                target_amount = safe_float(body.get("target_amount"), 0)
                category = body.get("category", "Tech")
                icon = body.get("icon", "🎯")
                deadline = body.get("deadline", "")

                cursor.execute("""
                    INSERT INTO goals (user_id, title, target_amount, current_amount, category, icon, deadline)
                    VALUES (%s, %s, %s, 0, %s, %s, %s)
                """, (uid, title, target_amount, category, icon, deadline))
                cursor.execute("UPDATE users SET points = points + 30 WHERE id = %s", (uid,))
                conn.commit()
                return json_response({"success": True, "message": "Savings goal created! +30 XP earned."})

            # POST /api/goals/deposit
            elif path == "/api/goals/deposit":
                uid = safe_int(body.get("user_id"), 1)
                goal_id = safe_int(body.get("goal_id"), 0)
                amount = safe_float(body.get("amount"), 0)

                cursor.execute("SELECT balance FROM users WHERE id = %s", (uid,))
                user_row = cursor.fetchone()
                if not user_row:
                    cursor.execute("SELECT balance FROM users ORDER BY id ASC LIMIT 1")
                    user_row = cursor.fetchone()
                balance = user_row["balance"] if user_row else 10000.0

                if balance < amount:
                    return json_response({"success": False, "message": "Insufficient pocket money balance!"}, 400)

                cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (amount, uid))
                cursor.execute("UPDATE goals SET current_amount = current_amount + %s WHERE id = %s", (amount, goal_id))

                cursor.execute("SELECT target_amount, current_amount, title FROM goals WHERE id = %s", (goal_id,))
                g = cursor.fetchone()
                completed = g["current_amount"] >= g["target_amount"]
                if completed:
                    cursor.execute("UPDATE goals SET status = 'completed' WHERE id = %s", (goal_id,))
                    cursor.execute("UPDATE users SET points = points + 200 WHERE id = %s", (uid,))

                conn.commit()
                msg = f'Saved ₹{amount} towards {g["title"]}!'
                if completed:
                    msg += " 🎉 GOAL REACHED! +200 XP Bonus!"
                return json_response({"success": True, "message": msg, "completed": completed})

            # POST /api/goals/delete
            elif path == "/api/goals/delete":
                goal_id = safe_int(body.get("id"), 0)
                uid = safe_int(body.get("user_id"), 1)

                cursor.execute("SELECT current_amount FROM goals WHERE id = %s AND user_id = %s", (goal_id, uid))
                g = cursor.fetchone()
                if g:
                    current_saved = g["current_amount"]
                    cursor.execute("DELETE FROM goals WHERE id = %s AND user_id = %s", (goal_id, uid))
                    if current_saved > 0:
                        cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (current_saved, uid))
                    conn.commit()
                    return json_response({"success": True, "message": f"Goal deleted! ₹{current_saved} refunded to balance."})
                else:
                    return json_response({"success": False, "message": "Goal not found."}, 404)

            # POST /api/should-i-buy
            elif path == "/api/should-i-buy":
                uid = safe_int(body.get("user_id"), 1)
                item_name = body.get("item_name")
                price = safe_float(body.get("price"), 0)
                category = body.get("category", "Shopping")
                is_need = 1 if body.get("is_need") else 0
                usage_freq = body.get("usage_freq", "Weekly")
                decision = body.get("decision", "cooldown")

                now = datetime.datetime.now()
                cooldown_until = (now + datetime.timedelta(hours=48)).strftime("%Y-%m-%d %H:%M:%S")
                status = "pending" if decision == "cooldown" else "completed"

                cursor.execute("""
                    INSERT INTO should_i_buy (user_id, item_name, price, category, is_need, usage_freq, decision, cooldown_until, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (uid, item_name, price, category, is_need, usage_freq, decision, cooldown_until, status))
                cursor.execute("UPDATE users SET points = points + 40 WHERE id = %s", (uid,))
                cursor.execute("""
                    INSERT INTO user_badges (user_id, badge_key, title, icon, description)
                    VALUES (%s, 'impulse_master', 'Pause Master ⏸️', '⏸️', 'Used the 48-Hour Cool-off timer to prevent impulse spending!')
                    ON CONFLICT (badge_key) DO NOTHING
                """, (uid,))
                conn.commit()
                return json_response({"success": True, "message": "48-Hour Cool-off Timer Started! +40 XP earned."})

            # POST /api/should-i-buy/resolve
            elif path == "/api/should-i-buy/resolve":
                uid = safe_int(body.get("user_id"), 1)
                item_id = safe_int(body.get("item_id"), 0)
                final_action = body.get("final_action")
                notes = body.get("notes", "")

                cursor.execute("SELECT * FROM should_i_buy WHERE id = %s AND user_id = %s", (item_id, uid))
                item = cursor.fetchone()

                if final_action == "saved":
                    cursor.execute("UPDATE users SET points = points + 150 WHERE id = %s", (uid,))
                    cursor.execute("""
                        UPDATE should_i_buy
                        SET status = 'completed', decision = 'saved', reflection_notes = %s
                        WHERE id = %s AND user_id = %s
                    """, (f"Saved ₹{item['price']}! " + notes, item_id, uid))
                    msg = f"Awesome decision! You saved ₹{item['price']} and earned +150 XP! 🏆"
                else:
                    cursor.execute("""
                        INSERT INTO expenses (user_id, title, amount, category, date, description)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (uid, f"Bought: {item['item_name']}", item["price"], item["category"],
                          datetime.date.today().isoformat(), "Planned purchase after 48h cool-off"))
                    cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (item["price"], uid))
                    cursor.execute("""
                        UPDATE should_i_buy
                        SET status = 'completed', decision = 'bought', reflection_notes = %s
                        WHERE id = %s AND user_id = %s
                    """, (notes, item_id, uid))
                    msg = "Purchase logged as planned expense!"

                conn.commit()
                return json_response({"success": True, "message": msg})

            # POST /api/should-i-buy/delete
            elif path == "/api/should-i-buy/delete":
                item_id = safe_int(body.get("id"), 0)
                uid = safe_int(body.get("user_id"), 1)
                cursor.execute("DELETE FROM should_i_buy WHERE id = %s AND user_id = %s", (item_id, uid))
                conn.commit()
                return json_response({"success": True, "message": "Impulse evaluation item removed."})

            # POST /api/quizzes/submit
            elif path == "/api/quizzes/submit":
                uid = safe_int(body.get("user_id"), 1)
                quiz_id = safe_int(body.get("quiz_id"), 0)
                selected_option = safe_int(body.get("selected_option"), 0)

                cursor.execute("SELECT * FROM quizzes WHERE id = %s", (quiz_id,))
                row = cursor.fetchone()
                if not row:
                    return json_response({"success": False, "message": "Quiz question not found."}, 404)

                quiz = dict(row)
                is_correct = 1 if selected_option == quiz["correct_option"] else 0

                cursor.execute("""
                    INSERT INTO user_quiz_attempts (user_id, quiz_id, selected_option, is_correct)
                    VALUES (%s, %s, %s, %s)
                """, (uid, quiz_id, selected_option, is_correct))

                points_earned = 0
                if is_correct:
                    points_earned = quiz["points_reward"]
                    cursor.execute("UPDATE users SET points = points + %s WHERE id = %s", (points_earned, uid))

                cursor.execute("SELECT id, points, level FROM users WHERE id = %s", (uid,))
                u = cursor.fetchone()
                if not u:
                    cursor.execute("SELECT id, points, level FROM users ORDER BY id ASC LIMIT 1")
                    u = cursor.fetchone()
                curr_points = u["points"] if u else 0
                curr_level = u["level"] if u else 1
                new_level = (curr_points // 200) + 1
                level_up = new_level > curr_level
                if level_up and u:
                    cursor.execute("UPDATE users SET level = %s WHERE id = %s", (new_level, u["id"]))

                conn.commit()
                return json_response({
                    "success": True,
                    "is_correct": bool(is_correct),
                    "explanation": quiz["explanation"],
                    "points_earned": points_earned,
                    "level_up": level_up,
                    "new_level": new_level,
                })

            # POST /api/challenges/claim
            elif path == "/api/challenges/claim":
                uid = safe_int(body.get("user_id"), 1)
                challenge_id = safe_int(body.get("challenge_id"), 0)

                cursor.execute("SELECT * FROM challenges WHERE id = %s", (challenge_id,))
                ch = cursor.fetchone()
                if ch["is_completed"]:
                    return json_response({"success": False, "message": "Challenge already claimed!"}, 400)

                cursor.execute(
                    "UPDATE challenges SET is_completed = TRUE, progress_val = target_val WHERE id = %s",
                    (challenge_id,)
                )
                cursor.execute(
                    "UPDATE users SET points = points + %s WHERE id = %s",
                    (ch["points_reward"], uid)
                )
                conn.commit()
                return json_response({"success": True, "message": f"Challenge Completed! +{ch['points_reward']} XP claimed! 🎉"})

            # POST /api/admin/quiz
            elif path == "/api/admin/quiz":
                title = body.get("title")
                category = body.get("category", "smart_shopping")
                scenario = body.get("scenario")
                opt_a = body.get("option_a")
                opt_b = body.get("option_b")
                opt_c = body.get("option_c")
                opt_d = body.get("option_d")
                correct_opt = safe_int(body.get("correct_option"), 1)
                explanation = body.get("explanation", "")
                points = safe_int(body.get("points_reward"), 50)

                cursor.execute("""
                    INSERT INTO quizzes (title, category, scenario, option_a, option_b, option_c, option_d, correct_option, explanation, points_reward)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (title, category, scenario, opt_a, opt_b, opt_c, opt_d, correct_opt, explanation, points))
                conn.commit()
                return json_response({"success": True, "message": "New MoneyQuest quiz question added!"})

            # POST /api/admin/user/update-role
            elif path == "/api/admin/user/update-role":
                target_user_id = safe_int(body.get("target_user_id"), 1)
                new_role = str(body.get("role", "teen"))
                new_pocket_money = safe_float(body.get("pocket_money"), 4000.0)

                cursor.execute("""
                    UPDATE users SET role = %s, pocket_money = %s WHERE id = %s
                """, (new_role, new_pocket_money, target_user_id))
                conn.commit()
                return json_response({"success": True, "message": "User role and allowance updated successfully!"})

            # POST /api/admin/user/delete
            elif path == "/api/admin/user/delete":
                target_user_id = safe_int(body.get("target_user_id"), 0)
                cursor.execute("DELETE FROM users WHERE id = %s", (target_user_id,))
                cursor.execute("DELETE FROM expenses WHERE user_id = %s", (target_user_id,))
                cursor.execute("DELETE FROM goals WHERE user_id = %s", (target_user_id,))
                cursor.execute("DELETE FROM should_i_buy WHERE user_id = %s", (target_user_id,))
                cursor.execute("DELETE FROM user_badges WHERE user_id = %s", (target_user_id,))
                conn.commit()
                return json_response({"success": True, "message": "User profile deleted cleanly."})

            # POST /api/parent/top-up
            elif path == "/api/parent/top-up":
                target_user_id = safe_int(body.get("target_user_id"), 0)
                amount = safe_float(body.get("amount"), 0)
                bonus_xp = safe_int(body.get("bonus_xp"), 50)
                note = body.get("note", "Parent allowance top-up")

                cursor.execute("""
                    UPDATE users SET balance = balance + %s, points = points + %s WHERE id = %s
                """, (amount, bonus_xp, target_user_id))
                cursor.execute("""
                    INSERT INTO user_badges (user_id, badge_key, title, icon, description)
                    VALUES (%s, %s, 'Chore Reward 🌟', '🌟', %s)
                    ON CONFLICT (badge_key) DO NOTHING
                """, (target_user_id, f"chore_{datetime.datetime.now().timestamp()}", f"Earned allowance bonus: {note}"))
                conn.commit()
                return json_response({"success": True, "message": f"Successfully topped up ₹{amount} and awarded +{bonus_xp} XP!"})

            # POST /api/reset
            elif path == "/api/reset":
                cursor.execute("DROP TABLE IF EXISTS user_quiz_attempts CASCADE")
                cursor.execute("DROP TABLE IF EXISTS user_badges CASCADE")
                cursor.execute("DROP TABLE IF EXISTS quizzes CASCADE")
                cursor.execute("DROP TABLE IF EXISTS challenges CASCADE")
                cursor.execute("DROP TABLE IF EXISTS should_i_buy CASCADE")
                cursor.execute("DROP TABLE IF EXISTS goals CASCADE")
                cursor.execute("DROP TABLE IF EXISTS expenses CASCADE")
                cursor.execute("DROP TABLE IF EXISTS users CASCADE")
                conn.commit()
                conn.close()
                # Re-seed by calling the init SQL (handled via supabase_schema.sql re-run)
                return json_response({"success": True, "message": "Database reset. Please re-run supabase_schema.sql to restore seed data."})

            else:
                return json_response({"error": "Invalid POST endpoint"}, 404)

        except Exception as e:
            conn.rollback()
            return json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    return json_response({"error": "Method not allowed"}, 405)
