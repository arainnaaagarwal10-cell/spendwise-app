/**
 * SpendWise Frontend JavaScript Application Engine
 * Handles multi-role authentication (Admin, Parent, Teen), dual-mode API with LocalStorage fallback,
 * dynamic UI rendering, Chart.js, cool-off timers, and responsive navigation.
 */

// Global State Object
const state = {
    activeUserId: null,
    user: null,
    stats: null,
    expenses: [],
    goals: [],
    impulseItems: [],
    challenges: [],
    quizzes: [],
    allUsers: [],
    allExpenses: [],
    selectedAvatar: '🎯',
    selectedRole: 'teen',
    activeTab: 'overview',
    timerInterval: null
};


// Web Audio API Synthesizer Sound Engine for Gaming & Fintech Vibe
const CyberAudioSynth = {
    audioCtx: null,
    sfxEnabled: localStorage.getItem('spendwise_sfx_muted') !== 'true',

    init() {
        if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioCtx();
        }
    },

    playCorrect() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) { }
    },

    playWrong() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.25);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) { }
    },

    playTick() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) { }
    },

    playFanfare() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.audioCtx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const now = this.audioCtx.currentTime + idx * 0.1;
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            });
        } catch (e) { }
    }
};

// SFX & Quiz Audio State Controller
function updateSFXUI(enabled, triggerToast = false) {
    CyberAudioSynth.sfxEnabled = enabled;
    localStorage.setItem('spendwise_sfx_muted', !enabled);

    const sfxBtn = document.getElementById('btnToggleSFX');
    const sfxText = document.getElementById('sfxStatusText');
    const quizMuteBtn = document.getElementById('btnQuizMuteToggle');
    const quizMuteIcon = document.getElementById('quizMuteIcon');
    const quizMuteText = document.getElementById('quizMuteText');

    if (enabled) {
        if (sfxBtn) {
            sfxBtn.classList.add('active');
            sfxBtn.classList.remove('muted');
        }
        if (sfxText) sfxText.textContent = 'SFX ON';

        if (quizMuteBtn) {
            quizMuteBtn.classList.add('active');
            quizMuteBtn.classList.remove('muted');
        }
        if (quizMuteIcon) quizMuteIcon.className = 'fa-solid fa-volume-high';
        if (quizMuteText) quizMuteText.textContent = 'Mute';

        if (triggerToast) {
            CyberAudioSynth.playCorrect();
            showToast('🔊 Quiz Sound Effects Enabled!', 'info');
        }
    } else {
        if (sfxBtn) {
            sfxBtn.classList.remove('active');
            sfxBtn.classList.add('muted');
        }
        if (sfxText) sfxText.textContent = 'SFX OFF';

        if (quizMuteBtn) {
            quizMuteBtn.classList.remove('active');
            quizMuteBtn.classList.add('muted');
        }
        if (quizMuteIcon) quizMuteIcon.className = 'fa-solid fa-volume-xmark';
        if (quizMuteText) quizMuteText.textContent = 'Unmute';

        if (triggerToast) {
            showToast('🔇 Quiz Sound Effects Muted', 'info');
        }
    }
}

// 10,000 Level Deterministic Financial Procedural Question Engine
const QuizEngine = {
    BASE_LEVELS: 10000,

    getTier(levelNum) {
        if (levelNum <= 1000) return { id: 1, name: 'Novice Saver', icon: '🌱', range: 'L1 - L1000', cat: 'smart_shopping' };
        if (levelNum <= 2500) return { id: 2, name: 'Budget Cyberpunk', icon: '💡', range: 'L1001 - L2500', cat: 'budgeting' };
        if (levelNum <= 4000) return { id: 3, name: 'Compound Interest Ninja', icon: '📈', range: 'L2501 - L4000', cat: 'saving_basics' };
        if (levelNum <= 5500) return { id: 4, name: 'Stock Market Strategist', icon: '🚀', range: 'L4001 - L5500', cat: 'investing' };
        if (levelNum <= 7000) return { id: 5, name: 'DeFi & Web3 Titan', icon: '⚡', range: 'L5501 - L7000', cat: 'crypto_web3' };
        if (levelNum <= 8500) return { id: 6, name: 'Real Estate Wealth Architect', icon: '🏢', range: 'L7001 - L8500', cat: 'real_estate' };
        if (levelNum <= 10000) return { id: 7, name: 'Galactic Financial Sovereign', icon: '👑', range: 'L8501 - L10000', cat: 'tax_wealth' };
        return { id: 8, name: 'Infinity Master Overlord', icon: '🌌', range: `L${levelNum}+`, cat: 'tax_wealth' };
    },

    getCustomQuizzes() {
        try {
            return JSON.parse(localStorage.getItem('spendwise_db_custom_quizzes') || '[]');
        } catch (e) {
            return [];
        }
    },

    getTotalCount() {
        return this.BASE_LEVELS + this.getCustomQuizzes().length;
    },

    getQuizByLevel(levelNum) {
        const customList = this.getCustomQuizzes();
        const customObj = customList.find(q => q.level === levelNum);
        if (customObj) return customObj;

        // Hand-crafted initial 4 levels
        if (levelNum === 1) {
            return {
                id: 1, level: 1, title: 'Level 1: The Impulse Headphones Trap', category: 'smart_shopping',
                scenario: 'Siya has ₹4,000 monthly pocket money. On Day 5, she sees cool wireless headphones for ₹1,299. What is the smartest move?',
                option_a: 'Buy them instantly with her balance.',
                option_b: 'Put them on a 48-hour cool-off period & create a savings goal.',
                option_c: 'Borrow money from a friend.',
                option_d: 'Spend all money on small snacks instead.',
                correct_option: 2, explanation: 'The 48-hour rule prevents impulse buys! Delaying gratification gives your brain time to evaluate.', points_reward: 60, is_boss: false
            };
        }
        if (levelNum === 2) {
            return {
                id: 2, level: 2, title: 'Level 2: Need vs. Want Challenge', category: 'budgeting',
                scenario: 'You forgot your lunch box at home. Buying a canteen meal costs ₹80. A designer water bottle costs ₹450. Which is a core NEED?',
                option_a: 'The designer water bottle.', option_b: 'Neither, stay hungry.',
                option_c: 'The ₹80 canteen lunch for nutrition.', option_d: 'Buying 5 candy bars.',
                correct_option: 3, explanation: 'A NEED is necessary for daily well-being and health (like lunch). A WANT is an optional upgrade.', points_reward: 50, is_boss: false
            };
        }
        if (levelNum === 3) {
            return {
                id: 3, level: 3, title: 'Level 3: The 50/30/20 Rule for Teenagers', category: 'saving_basics',
                scenario: 'If you receive ₹4,000 pocket money, what does the teen saving rule suggest for your 20% savings portion?',
                option_a: 'Save ₹800 (20%) immediately before spending on wants!', option_b: 'Spend ₹4,000 completely and save leftover coins.',
                option_c: 'Give ₹4,000 to a friend.', option_d: 'Save 100% and never go out.',
                correct_option: 1, explanation: 'Paying yourself FIRST guarantees achieving long-term goals effortlessly!', points_reward: 70, is_boss: false
            };
        }
        if (levelNum === 4) {
            return {
                id: 4, level: 4, title: 'Level 4: Peer Pressure Spending', category: 'mindset',
                scenario: 'Friends are buying ₹500 concert merchandise. You only have ₹600 left for the month. What should you do?',
                option_a: 'Buy it anyway so you do not feel left out.', option_b: 'Politely decline or choose a small ₹50 souvenir, staying within budget.',
                option_c: 'Lie and say you lost your wallet.', option_d: 'Take a high-interest loan from an app.',
                correct_option: 2, explanation: 'True financial confidence means staying true to your budget regardless of peer pressure!', points_reward: 60, is_boss: false
            };
        }

        // Procedural generator for Levels 5 to 10,000+
        const isBoss = (levelNum % 50 === 0) || (levelNum % 100 === 0);
        const tierInfo = this.getTier(levelNum);

        const seed = (levelNum * 9301 + 49297) % 233280;
        const categories = ['smart_shopping', 'budgeting', 'saving_basics', 'mindset', 'investing', 'crypto_web3', 'real_estate', 'tax_wealth'];
        const cat = categories[seed % categories.length];

        const items = ['Gaming Laptop', 'Wireless Noise-Cancelling Earbuds', 'Electric Skateboard', '4K Smart Monitor', 'VR Headset', 'Mechanical Keyboard', 'Action Camera', 'Smart Watch'];
        const item = items[seed % items.length];

        const price = Math.round((seed % 60 + 10) * 100);
        const allowance = Math.round((seed % 40 + 30) * 100);
        const correctOptVal = 2;

        let title = `Level ${levelNum}: ${isBoss ? '⚠️ BOSS BATTLE - ' : ''}${tierInfo.name} Quest #${levelNum}`;
        let scenario = '';
        let optA = '', optB = '', optC = '', optD = '';
        let explanation = '';

        if (isBoss) {
            scenario = `🔥 BOSS BATTLE (Level ${levelNum}): An online crypto scheme promises a guaranteed 500% daily return on a ₹${price} deposit. How should a disciplined investor respond?`;
            optA = `Invest all ₹${price} balance immediately before the deal expires.`;
            optB = `Identify it as a fraudulent Ponzi scheme and decline immediately!`;
            optC = `Borrow money from 5 friends to double your payout.`;
            optD = `Share your secret wallet seed phrase on social media.`;
            explanation = `Guaranteed 500% returns are classic financial scams! High returns always carry proportionate risk. Protect your principal balance!`;
        } else if (cat === 'investing') {
            scenario = `At Level ${levelNum}, you have saved ₹${price}. What is the most reliable long-term investment strategy to build generational wealth?`;
            optA = `Keep physical cash hidden in a drawer.`;
            optB = `Invest in a low-cost, broadly diversified index fund / ETF.`;
            optC = `Put 100% of funds into a single viral hype penny stock.`;
            optD = `Buy 50 designer shirts.`;
            explanation = `Low-cost index funds provide compound growth and diversification, drastically minimizing individual asset failure risks!`;
        } else if (cat === 'crypto_web3') {
            scenario = `At Level ${levelNum}, a new decentralized finance protocol offers yield farming. What is your smartest risk management move?`;
            optA = `Verify smart contract audit reports, liquidity pools, and invest only risk-capital.`;
            optB = `Borrow maximum high-interest money to bet on unverified tokens.`;
            optC = `Send your private recovery keys to a stranger offering free tokens.`;
            optD = `Ignore all security warnings.`;
            explanation = `In Web3 and DeFi, self-custody security and code auditing review are critical before committing capital!`;
        } else {
            scenario = `At Level ${levelNum}, you are eyeing a ₹${price} ${item} with a monthly pocket money of ₹${allowance}. What is the optimal money move?`;
            optA = `Buy immediately on credit and pay expensive interest fees.`;
            optB = `Set up a monthly target goal of ₹${Math.round(price / 3)} for 3 months using the 48-hour cool-off rule.`;
            optC = `Skip buying food and necessities for an entire month.`;
            optD = `Spend all remaining pocket money on lottery tickets.`;
            explanation = `Target savings goals prevent impulse regret and ensure you maintain a healthy liquid cash cushion!`;
        }

        const xp = isBoss ? 200 : (50 + Math.floor(levelNum / 200) * 10);

        return {
            id: levelNum,
            level: levelNum,
            title: title,
            category: cat,
            scenario: scenario,
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_option: correctOptVal,
            explanation: explanation,
            points_reward: xp,
            is_boss: isBoss
        };
    }
};

// LocalStorage Fallback Storage Engine
const LocalStorageEngine = {
    getKey(name) { return `spendwise_db_${name}`; },
    
    initDefaultData() {
        if (!localStorage.getItem(this.getKey('users'))) {
            const users = [
                { id: 1, name: 'ArainnaaAgarwal10', username: 'ArainnaaAgarwal10', password: 'Arainnaa123', role: 'admin', pocket_money: 10000.0, balance: 10000.0, points: 1200, level: 5, streak: 12, avatar: '👑' },
                { id: 2, name: 'Parent Sarah', username: 'sarah', password: 'sarah123', role: 'parent', pocket_money: 8000.0, balance: 8000.0, points: 850, level: 4, streak: 8, avatar: '🛡️' },
                { id: 3, name: 'Siya', username: 'siya', password: 'siya123', role: 'teen', pocket_money: 4000.0, balance: 2250.0, points: 420, level: 2, streak: 4, avatar: '🎯' },
                { id: 4, name: 'Sam', username: 'sam', password: 'sam123', role: 'teen', pocket_money: 3000.0, balance: 1800.0, points: 250, level: 1, streak: 2, avatar: '🚀' }
            ];
            const expenses = [
                { id: 1, user_id: 3, title: 'Starbucks Iced Latte with Friends', amount: 320.0, category: 'Outings', date: '2026-08-20', description: 'Weekend hangout at cafe' },
                { id: 2, user_id: 3, title: 'Reference Book for Physics Class 11', amount: 450.0, category: 'Hobbies', date: '2026-08-21', description: 'Exam prep textbook' },
                { id: 3, user_id: 3, title: 'Fast Food Combo Meal', amount: 280.0, category: 'Food', date: '2026-08-22', description: 'After school snack' },
                { id: 4, user_id: 4, title: 'Gaming Mouse', amount: 899.0, category: 'Tech', date: '2026-08-23', description: 'Setup upgrade' }
            ];
            const goals = [
                { id: 1, user_id: 3, title: 'Wireless Noise-Cancelling Headphones', target_amount: 1299.0, current_amount: 850.0, category: 'Tech', icon: '🎧', deadline: '2026-09-15', status: 'active' },
                { id: 2, user_id: 3, title: 'Concert Ticket for Favorite Band', target_amount: 2000.0, current_amount: 500.0, category: 'Entertainment', icon: '🎟️', deadline: '2026-10-01', status: 'active' }
            ];
            const now = new Date();
            const cooldownTime = new Date(now.getTime() + 36 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
            const impulse = [
                { id: 1, user_id: 3, item_name: 'Trendy Wireless Headphones', price: 1299.0, category: 'Tech', is_need: 0, usage_freq: 'Daily', decision: 'cooldown', cooldown_until: cooldownTime, status: 'pending', reflection_notes: 'Saw online, looks cool' },
                { id: 2, user_id: 3, item_name: 'Designer Sneaker Keychains', price: 499.0, category: 'Shopping', is_need: 0, usage_freq: 'Rarely', decision: 'saved', cooldown_until: null, status: 'completed', reflection_notes: 'Decided after 48h pause I did not need it!' }
            ];
            const challenges = [
                { id: 1, title: '48-Hour Purchase Pause', description: 'Wait 48 hours before buying any non-essential item over ₹300.', category: 'impulse', points_reward: 150, target_val: 1, progress_val: 1, is_completed: 1 },
                { id: 2, title: '3-Day No-Junk Food Streak', description: 'Avoid spending pocket money on junk food/cafes for 3 consecutive days.', category: 'saving', points_reward: 120, target_val: 3, progress_val: 2, is_completed: 0 },
                { id: 3, title: 'Goal Booster Depositor', description: 'Make 2 deposits into your savings goal this week.', category: 'goals', points_reward: 100, target_val: 2, progress_val: 1, is_completed: 0 },
                { id: 4, title: 'Financial Quiz Master', description: 'Answer 3 financial quizzes with 100% accuracy.', category: 'learning', points_reward: 150, target_val: 3, progress_val: 2, is_completed: 0 }
            ];
            const quizzes = [
                { id: 1, title: 'The Impulse Headphones Trap', category: 'smart_shopping', scenario: 'Siya has ₹4,000 monthly pocket money. On Day 5, she sees cool wireless headphones for ₹1,299. What is the smartest move?', option_a: 'Buy them instantly with her balance.', option_b: 'Put them on a 48-hour cool-off period & create a savings goal.', option_c: 'Borrow money from a friend.', option_d: 'Spend all money on small snacks instead.', correct_option: 2, explanation: 'The 48-hour rule prevents impulse buys! Delaying gratification gives your brain time to evaluate.', points_reward: 60 },
                { id: 2, title: 'Need vs. Want Challenge', category: 'budgeting', scenario: 'You forgot your lunch box at home. Buying a canteen meal costs ₹80. A designer water bottle costs ₹450. Which is a core NEED?', option_a: 'The designer water bottle.', option_b: 'Neither, stay hungry.', option_c: 'The ₹80 canteen lunch for nutrition.', option_d: 'Buying 5 candy bars.', correct_option: 3, explanation: 'A NEED is necessary for daily well-being and health (like lunch). A WANT is an optional upgrade.', points_reward: 50 },
                { id: 3, title: 'The 50/30/20 Rule for Teenagers', category: 'saving_basics', scenario: 'If you receive ₹4,000 pocket money, what does the teen saving rule suggest for your 20% savings portion?', option_a: 'Save ₹800 (20%) immediately before spending on wants!', option_b: 'Spend ₹4,000 completely and save leftover coins.', option_c: 'Give ₹4,000 to a friend.', option_d: 'Save 100% and never go out.', correct_option: 1, explanation: 'Paying yourself FIRST guarantees achieving long-term goals effortlessly!', points_reward: 70 },
                { id: 4, title: 'Peer Pressure Spending', category: 'mindset', scenario: 'Friends are buying ₹500 concert merchandise. You only have ₹600 left for the month. What should you do?', option_a: 'Buy it anyway so you do not feel left out.', option_b: 'Politely decline or choose a small ₹50 souvenir, staying within budget.', option_c: 'Lie and say you lost your wallet.', option_d: 'Take a high-interest loan from an app.', correct_option: 2, explanation: 'True financial confidence means staying true to your budget regardless of peer pressure!', points_reward: 60 }
            ];
            const badges = [
                { id: 1, user_id: 3, badge_key: 'impulse_slayer', title: 'Impulse Slayer', icon: '🛡️', description: 'Completed your first 48-hour purchase pause reflection!' },
                { id: 2, user_id: 3, badge_key: 'budget_rookie', title: 'Smart Saver', icon: '🌱', description: 'Created your very first savings goal in SpendWise!' }
            ];

            localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            localStorage.setItem(this.getKey('expenses'), JSON.stringify(expenses));
            localStorage.setItem(this.getKey('goals'), JSON.stringify(goals));
            localStorage.setItem(this.getKey('impulse'), JSON.stringify(impulse));
            localStorage.setItem(this.getKey('challenges'), JSON.stringify(challenges));
            localStorage.setItem(this.getKey('quizzes'), JSON.stringify(quizzes));
            localStorage.setItem(this.getKey('badges'), JSON.stringify(badges));
            localStorage.setItem(this.getKey('quiz_attempts'), JSON.stringify({}));
        }
    },

    getUsers() { return JSON.parse(localStorage.getItem(this.getKey('users')) || '[]'); },
    getExpenses() { return JSON.parse(localStorage.getItem(this.getKey('expenses')) || '[]'); },
    getGoals() { return JSON.parse(localStorage.getItem(this.getKey('goals')) || '[]'); },
    getImpulse() { return JSON.parse(localStorage.getItem(this.getKey('impulse')) || '[]'); },
    getChallenges() { return JSON.parse(localStorage.getItem(this.getKey('challenges')) || '[]'); },
    getQuizzes() { return JSON.parse(localStorage.getItem(this.getKey('quizzes')) || '[]'); },
    getBadges() { return JSON.parse(localStorage.getItem(this.getKey('badges')) || '[]'); },

    get(endpoint) {
        this.initDefaultData();
        const userId = state.activeUserId || 1;
        const users = this.getUsers();

        if (endpoint === '/users') return { success: true, users };

        if (endpoint.startsWith('/user')) {
            const user = users.find(u => u.id === userId) || users[0];
            const badges = this.getBadges().filter(b => b.user_id === user.id);
            return { success: true, user: { ...user, badges } };
        }
        if (endpoint.startsWith('/expenses')) {
            const expenses = this.getExpenses().filter(e => e.user_id === userId);
            return { success: true, expenses };
        }
        if (endpoint.startsWith('/goals')) {
            const goals = this.getGoals().filter(g => g.user_id === userId);
            return { success: true, goals };
        }
        if (endpoint.startsWith('/should-i-buy')) {
            const items = this.getImpulse().filter(i => i.user_id === userId);
            return { success: true, items };
        }
        if (endpoint.startsWith('/challenges')) {
            return { success: true, challenges: this.getChallenges() };
        }
        if (endpoint.startsWith('/quizzes')) {
            const attempts = JSON.parse(localStorage.getItem(this.getKey('quiz_attempts')) || '{}');
            const userAttempts = attempts[userId] || {};
            const quizzes = this.getQuizzes().map(q => ({
                ...q,
                attempted: q.id in userAttempts,
                is_correct: userAttempts[q.id]
            }));
            return { success: true, quizzes };
        }
        if (endpoint.startsWith('/stats')) {
            const user = users.find(u => u.id === userId) || users[0];
            const userExpenses = this.getExpenses().filter(e => e.user_id === user.id);
            const totalSpent = userExpenses.reduce((acc, cur) => acc + cur.amount, 0);
            const activeGoals = this.getGoals().filter(g => g.user_id === user.id && g.status === 'active').length;
            const pendingCooldowns = this.getImpulse().filter(i => i.user_id === user.id && i.status === 'pending').length;

            return {
                success: true,
                stats: {
                    balance: user.balance,
                    pocket_money: user.pocket_money,
                    spent_total: totalSpent,
                    spent_percent: minMaxPercent(totalSpent, user.pocket_money),
                    points: user.points,
                    level: user.level,
                    streak: user.streak,
                    active_goals: activeGoals,
                    pending_cooldowns: pendingCooldowns
                }
            };
        }
        if (endpoint === '/admin/all-data') {
            const allExpenses = this.getExpenses().map(e => {
                const u = users.find(usr => usr.id === e.user_id);
                return { ...e, user_name: u ? u.name : 'Unknown User' };
            });
            return {
                success: true,
                users,
                expenses: allExpenses,
                quiz_count: this.getQuizzes().length,
                goal_count: this.getGoals().length
            };
        }
        return { success: false, error: 'Endpoint not found' };
    },

    post(endpoint, data = {}) {
        this.initDefaultData();
        const userId = data.user_id || state.activeUserId || 1;
        const users = this.getUsers();

        if (endpoint === '/register') {
            const role = (data.role || 'teen').toLowerCase();
            const username = (data.username || '').trim();
            const password = (data.password || '').trim();

            if (role === 'admin') {
                // Validate admin credentials
                if (username.toLowerCase() !== 'arainnaaagarwal10' || password !== 'Arainnaa123') {
                    return { success: false, message: 'Access denied. Invalid admin credentials.' };
                }
                // If admin already exists with correct credentials, sign them in directly
                const existingAdmin = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
                if (existingAdmin) {
                    const badges = this.getBadges().filter(b => b.user_id === existingAdmin.id);
                    return { success: true, user: { ...existingAdmin, badges }, message: `Welcome back, ${existingAdmin.name}! Signed in as Admin.` };
                }
            } else {
                // For non-admin: block duplicate usernames
                if (username && users.find(u => u.username?.toLowerCase() === username.toLowerCase())) {
                    return { success: false, message: `Username "${username}" is already taken. Please choose a different one.` };
                }
            }

            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            const newUser = {
                id: newId,
                name: data.name || (role === 'admin' ? 'ArainnaaAgarwal10' : 'User'),
                username: username || (data.name || 'user').toLowerCase().replace(/\s+/g, '_'),
                password: password || 'pass123',
                role: role,
                pocket_money: parseFloat(data.pocket_money || 4000),
                balance: parseFloat(data.pocket_money || 4000),
                points: 0,
                level: 1,
                streak: 1,
                avatar: data.avatar || '🎯'
            };
            users.push(newUser);
            localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            return { success: true, user: newUser, message: `Account created for ${newUser.name} (${newUser.role.toUpperCase()})! 🎉` };
        }
        if (endpoint === '/login') {
            let user = null;
            const username = (data.username || '').trim();
            const password = (data.password || '').trim();

            if (username && password) {
                // Match any user by username + password
                user = users.find(u =>
                    u.username?.toLowerCase() === username.toLowerCase() &&
                    u.password === password
                );
                if (!user) return { success: false, message: 'Invalid username or password. Please try again.' };
            } else if (data.user_id) {
                // Demo bypass: login by user_id (no password check)
                user = users.find(u => u.id === data.user_id);
                if (!user) return { success: false, message: 'User profile not found!' };
            } else {
                return { success: false, message: 'Username and password are required to sign in!' };
            }

            const badges = this.getBadges().filter(b => b.user_id === user.id);
            return { success: true, user: { ...user, badges }, message: `Welcome back, ${user.name}! 🌟` };
        }
        if (endpoint === '/user/update') {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const diff = parseFloat(data.pocket_money) - users[userIndex].pocket_money;
                users[userIndex].name = data.name;
                users[userIndex].pocket_money = parseFloat(data.pocket_money);
                users[userIndex].balance = Math.max(0, users[userIndex].balance + diff);
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }
            return { success: true, message: 'Profile updated successfully!' };
        }
        if (endpoint === '/expenses') {
            const expenses = this.getExpenses();
            const newExp = {
                id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
                user_id: userId,
                title: data.title,
                amount: parseFloat(data.amount),
                category: data.category,
                date: data.date || new Date().toISOString().split('T')[0],
                description: data.description || ''
            };
            expenses.unshift(newExp);
            localStorage.setItem(this.getKey('expenses'), JSON.stringify(expenses));

            // Deduct balance and add XP
            const user = users.find(u => u.id === userId);
            if (user) {
                user.balance = Math.max(0, user.balance - newExp.amount);
                user.points += 10;
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }
            return { success: true, message: 'Expense recorded! +10 XP earned for tracking.' };
        }
        if (endpoint === '/expenses/delete') {
            let expenses = this.getExpenses();
            const exp = expenses.find(e => e.id === data.id);
            if (exp) {
                expenses = expenses.filter(e => e.id !== data.id);
                localStorage.setItem(this.getKey('expenses'), JSON.stringify(expenses));

                const user = users.find(u => u.id === userId);
                if (user) {
                    user.balance += exp.amount;
                    localStorage.setItem(this.getKey('users'), JSON.stringify(users));
                }
                return { success: true, message: `Expense deleted and ₹${exp.amount} refunded.` };
            }
        }
        if (endpoint === '/goals') {
            const goals = this.getGoals();
            const newGoal = {
                id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
                user_id: userId,
                title: data.title,
                target_amount: parseFloat(data.target_amount),
                current_amount: 0,
                category: data.category || 'Tech',
                icon: data.icon || '🎯',
                deadline: data.deadline || '',
                status: 'active'
            };
            goals.unshift(newGoal);
            localStorage.setItem(this.getKey('goals'), JSON.stringify(goals));

            const user = users.find(u => u.id === userId);
            if (user) {
                user.points += 30;
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }
            return { success: true, message: 'Savings goal created! +30 XP earned.' };
        }
        if (endpoint === '/goals/deposit') {
            const goals = this.getGoals();
            const goal = goals.find(g => g.id === data.goal_id);
            const user = users.find(u => u.id === userId);
            if (!user || user.balance < data.amount) {
                return { success: false, message: 'Insufficient pocket money balance!' };
            }
            user.balance -= data.amount;
            goal.current_amount += data.amount;
            const completed = goal.current_amount >= goal.target_amount;
            if (completed) {
                goal.status = 'completed';
                user.points += 200;
            }
            localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            localStorage.setItem(this.getKey('goals'), JSON.stringify(goals));
            let msg = `Saved ₹${data.amount} towards ${goal.title}!`;
            if (completed) msg += ' 🎉 GOAL REACHED! +200 XP Bonus!';
            return { success: true, message: msg, completed };
        }
        if (endpoint === '/goals/delete') {
            let goals = this.getGoals();
            const g = goals.find(item => item.id === data.id);
            if (g) {
                goals = goals.filter(item => item.id !== data.id);
                localStorage.setItem(this.getKey('goals'), JSON.stringify(goals));
                const user = users.find(u => u.id === userId);
                if (user && g.current_amount > 0) {
                    user.balance += g.current_amount;
                    localStorage.setItem(this.getKey('users'), JSON.stringify(users));
                }
                return { success: true, message: `Goal deleted! ₹${g.current_amount} refunded.` };
            }
        }
        if (endpoint === '/should-i-buy') {
            const impulse = this.getImpulse();
            const now = new Date();
            const cooldownUntil = new Date(now.getTime() + 48 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
            const newItem = {
                id: impulse.length > 0 ? Math.max(...impulse.map(i => i.id)) + 1 : 1,
                user_id: userId,
                item_name: data.item_name,
                price: parseFloat(data.price),
                category: data.category || 'Shopping',
                is_need: data.is_need ? 1 : 0,
                usage_freq: data.usage_freq || 'Weekly',
                decision: 'cooldown',
                cooldown_until: cooldownUntil,
                status: 'pending',
                reflection_notes: ''
            };
            impulse.unshift(newItem);
            localStorage.setItem(this.getKey('impulse'), JSON.stringify(impulse));

            const user = users.find(u => u.id === userId);
            if (user) {
                user.points += 40;
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }
            return { success: true, message: '48-Hour Cool-off Timer Started! +40 XP earned.' };
        }
        if (endpoint === '/should-i-buy/resolve') {
            const impulse = this.getImpulse();
            const item = impulse.find(i => i.id === data.item_id);
            const user = users.find(u => u.id === userId);
            if (item) {
                item.status = 'completed';
                if (data.final_action === 'saved') {
                    item.decision = 'saved';
                    item.reflection_notes = `Saved ₹${item.price}! ${data.notes || ''}`;
                    if (user) user.points += 150;
                } else {
                    item.decision = 'bought';
                    item.reflection_notes = data.notes || 'Bought after 48h reflection';
                    if (user) user.balance = Math.max(0, user.balance - item.price);
                }
                localStorage.setItem(this.getKey('impulse'), JSON.stringify(impulse));
                if (user) localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }
            return { success: true, message: data.final_action === 'saved' ? `Saved ₹${item.price}! +150 XP earned!` : 'Purchase logged as planned expense.' };
        }
        if (endpoint === '/should-i-buy/delete') {
            let impulse = this.getImpulse();
            impulse = impulse.filter(i => i.id !== data.id);
            localStorage.setItem(this.getKey('impulse'), JSON.stringify(impulse));
            return { success: true, message: 'Impulse evaluation item removed.' };
        }
        if (endpoint === '/quizzes/submit') {
            const quizzes = this.getQuizzes();
            const q = quizzes.find(item => item.id === data.quiz_id);
            const isCorrect = q && data.selected_option === q.correct_option;
            const pointsEarned = isCorrect ? q.points_reward : 0;

            const attempts = JSON.parse(localStorage.getItem(this.getKey('quiz_attempts')) || '{}');
            if (!attempts[userId]) attempts[userId] = {};
            attempts[userId][data.quiz_id] = isCorrect;
            localStorage.setItem(this.getKey('quiz_attempts'), JSON.stringify(attempts));

            const user = users.find(u => u.id === userId);
            let levelUp = false;
            let newLevel = 1;
            if (user) {
                if (isCorrect) user.points += pointsEarned;
                newLevel = Math.floor(user.points / 200) + 1;
                levelUp = newLevel > user.level;
                if (levelUp) user.level = newLevel;
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
            }

            return {
                success: true,
                is_correct: isCorrect,
                explanation: q ? q.explanation : '',
                points_earned: pointsEarned,
                level_up: levelUp,
                new_level: newLevel
            };
        }
        if (endpoint === '/challenges/claim') {
            const challenges = this.getChallenges();
            const ch = challenges.find(item => item.id === data.challenge_id);
            if (ch && !ch.is_completed) {
                ch.is_completed = 1;
                ch.progress_val = ch.target_val;
                localStorage.setItem(this.getKey('challenges'), JSON.stringify(challenges));

                const user = users.find(u => u.id === userId);
                if (user) {
                    user.points += ch.points_reward;
                    localStorage.setItem(this.getKey('users'), JSON.stringify(users));
                }
                return { success: true, message: `Challenge Completed! +${ch.points_reward} XP claimed! 🎉` };
            }
        }
        if (endpoint === '/admin/user/update-role') {
            const user = users.find(u => u.id === data.target_user_id);
            if (user) {
                user.role = data.role;
                user.pocket_money = parseFloat(data.pocket_money);
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
                return { success: true, message: 'User role and allowance updated successfully!' };
            }
        }
        if (endpoint === '/admin/user/delete') {
            let filteredUsers = users.filter(u => u.id !== data.target_user_id);
            localStorage.setItem(this.getKey('users'), JSON.stringify(filteredUsers));
            return { success: true, message: 'User profile deleted cleanly.' };
        }
        if (endpoint === '/admin/quiz') {
            const quizzes = this.getQuizzes();
            const newQ = {
                id: quizzes.length > 0 ? Math.max(...quizzes.map(q => q.id)) + 1 : 1,
                title: data.title,
                category: data.category || 'smart_shopping',
                scenario: data.scenario,
                option_a: data.option_a,
                option_b: data.option_b,
                option_c: data.option_c,
                option_d: data.option_d,
                correct_option: parseInt(data.correct_option),
                explanation: data.explanation,
                points_reward: parseInt(data.points_reward || 50)
            };
            quizzes.push(newQ);
            localStorage.setItem(this.getKey('quizzes'), JSON.stringify(quizzes));
            return { success: true, message: 'New MoneyQuest quiz question added!' };
        }
        if (endpoint === '/parent/top-up') {
            const user = users.find(u => u.id === data.target_user_id);
            if (user) {
                user.balance += parseFloat(data.amount || 0);
                user.points += parseInt(data.bonus_xp || 50);
                localStorage.setItem(this.getKey('users'), JSON.stringify(users));
                return { success: true, message: `Successfully topped up ₹${data.amount} and awarded +${data.bonus_xp} XP!` };
            }
        }
        if (endpoint === '/reset') {
            localStorage.removeItem(this.getKey('users'));
            localStorage.removeItem(this.getKey('expenses'));
            localStorage.removeItem(this.getKey('goals'));
            localStorage.removeItem(this.getKey('impulse'));
            localStorage.removeItem(this.getKey('challenges'));
            localStorage.removeItem(this.getKey('quizzes'));
            localStorage.removeItem(this.getKey('badges'));
            localStorage.removeItem(this.getKey('quiz_attempts'));
            this.initDefaultData();
            return { success: true, message: 'Data reset to default SpendWise state!' };
        }

        return { success: true, message: 'Action executed successfully.' };
    }
};

function minMaxPercent(val, max) {
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.round((val / max) * 100));
}

// Master API Engine Helper
const API = {
    async get(endpoint) {
        try {
            const separator = endpoint.includes('?') ? '&' : '?';
            const url = `/api${endpoint}${state.activeUserId ? `${separator}user_id=${state.activeUserId}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return await res.json();
        } catch (err) {
            return LocalStorageEngine.get(endpoint);
        }
    },
    async post(endpoint, data = {}) {
        try {
            if (state.activeUserId && !data.user_id) {
                data.user_id = state.activeUserId;
            }
            const res = await fetch(`/api${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Server error');
            return json;
        } catch (err) {
            return LocalStorageEngine.post(endpoint, data);
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initNavigation();
    initMobileDrawer();
    initModals();
    initForms();
    updateSFXUI(CyberAudioSynth.sfxEnabled, false);


    // Check stored user authentication
    const storedUserId = localStorage.getItem('spendwise_user_id');
    if (storedUserId) {
        state.activeUserId = parseInt(storedUserId);
        const success = await loadAllData();
        if (success) {
            showMainApp();
        } else {
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }

    // Live 1-second countdown timer for active 48h cool-off items
    state.timerInterval = setInterval(updateCooloffTimers, 1000);
});

// Authentication & Role Switcher
function initAuth() {
    const tabRegister = document.getElementById('tabBtnRegister');
    const tabLogin = document.getElementById('tabBtnLogin');
    const formRegister = document.getElementById('formRegister');
    const formLogin = document.getElementById('formLogin');
    const roleSelector = document.getElementById('roleSelector');
    const avatarSelector = document.getElementById('avatarSelector');
    const authNotice = document.getElementById('authNotice');

    // Role notices map
    const roleNotices = {
        teen: '<i class="fa-solid fa-sparkles"></i> 🎯 <strong>Teen Account</strong>: Track pocket money, save for goals, and stop impulse buys with 48h cool-off!',
        parent: '<i class="fa-solid fa-shield-halved"></i> 🛡️ <strong>Parent / Guardian</strong>: Approve allowance top-ups, monitor savings, and reward chores!',
        admin: '<i class="fa-solid fa-crown"></i> 👑 <strong>Admin Manager</strong>: Full system authority to manage accounts, edit roles, and create trivia quizzes!'
    };

    // Auth Tab Toggles
    tabRegister?.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = '';
        formLogin.style.display = 'none';
    });

    tabLogin?.addEventListener('click', async () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = '';
        formRegister.style.display = 'none';
        await loadUserProfilesGrid();
    });

    // Helper to select role
    function selectRole(role, btnElement) {
        state.selectedRole = role;
        document.querySelectorAll('.role-opt').forEach(b => b.classList.remove('active'));
        if (btnElement) {
            btnElement.classList.add('active');
        } else {
            document.querySelector(`.role-opt[data-role="${role}"]`)?.classList.add('active');
        }
        if (authNotice && roleNotices[role]) {
            authNotice.innerHTML = roleNotices[role];
        }
        // Show admin restriction notice when admin is selected
        const adminAuthFields = document.getElementById('adminAuthFields');
        if (adminAuthFields) {
            adminAuthFields.style.display = (role === 'admin') ? 'block' : 'none';
        }
    }

    // Helper to select avatar
    function selectAvatar(avatar, btnElement) {
        state.selectedAvatar = avatar;
        document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('active'));
        if (btnElement) {
            btnElement.classList.add('active');
        } else {
            document.querySelector(`.avatar-opt[data-avatar="${avatar}"]`)?.classList.add('active');
        }
    }

    // Role Selector Click Handler & Delegation
    if (roleSelector) {
        roleSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.role-opt');
            if (btn) {
                const role = btn.getAttribute('data-role');
                if (role) selectRole(role, btn);
            }
        });
    }

    // Avatar Selector Click Handler & Delegation
    if (avatarSelector) {
        avatarSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.avatar-opt');
            if (btn) {
                const avatar = btn.getAttribute('data-avatar');
                if (avatar) selectAvatar(avatar, btn);
            }
        });
    }

    // Form Register Submit
    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formRegister.querySelector('button[type="submit"]');
        const nameVal = document.getElementById('regName')?.value?.trim();
        const rawMoney = document.getElementById('regPocketMoney')?.value;
        const pocketMoney = parseFloat(rawMoney);
        const role = state.selectedRole || 'teen';
        const avatar = state.selectedAvatar || '🎯';

        const usernameVal = document.getElementById('regUsername')?.value?.trim() || '';
        const passwordVal = document.getElementById('regPassword')?.value?.trim() || '';
        const confirmPasswordVal = document.getElementById('regConfirmPassword')?.value?.trim() || '';

        // Validate name
        if (!nameVal) {
            showToast('Please enter your name.', 'warning');
            document.getElementById('regName')?.focus();
            return;
        }

        // Validate credentials
        if (!usernameVal) {
            showToast('Please choose a username.', 'warning');
            document.getElementById('regUsername')?.focus();
            return;
        }
        if (!passwordVal) {
            showToast('Please choose a password.', 'warning');
            document.getElementById('regPassword')?.focus();
            return;
        }
        if (passwordVal.length < 4) {
            showToast('Password must be at least 4 characters.', 'warning');
            document.getElementById('regPassword')?.focus();
            return;
        }
        if (passwordVal !== confirmPasswordVal) {
            showToast('Passwords do not match. Please re-enter.', 'error');
            document.getElementById('regConfirmPassword')?.focus();
            return;
        }

        // Admin credential enforcement
        if (role === 'admin') {
            if (usernameVal.toLowerCase() !== 'arainnaaagarwal10' || passwordVal !== 'Arainnaa123') {
                showToast('Access denied. Invalid admin credentials.', 'error');
                return;
            }
        }

        if (isNaN(pocketMoney) || pocketMoney < 0) {
            showToast('Please enter a valid monthly pocket money amount.', 'warning');
            document.getElementById('regPocketMoney')?.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        }

        try {
            const regPayload = {
                name: nameVal,
                username: usernameVal,
                password: passwordVal,
                role,
                pocket_money: pocketMoney,
                avatar
            };

            const res = await API.post('/register', regPayload);
            if (res && res.success && res.user) {
                state.activeUserId = res.user.id;
                localStorage.setItem('spendwise_user_id', res.user.id);
                showToast(res.message || 'Account created successfully!', 'success');
                
                if (typeof confetti === 'function') {
                    try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(err){}
                }

                await loadAllData();
                showMainApp();
                if (role === 'admin') switchTab('admin');
            } else {
                showToast(res?.message || 'Could not create account. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Registration error:', err);
            showToast('Failed to create account. Check console or try again.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account & Get Started';
            }
        }
    });

    // Sign In Form Submit (username + password for all users)
    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btnSignInSubmit');
        const username = document.getElementById('loginUsername')?.value?.trim();
        const password = document.getElementById('loginPassword')?.value?.trim();

        if (!username) {
            showToast('Please enter your username.', 'warning');
            document.getElementById('loginUsername')?.focus();
            return;
        }
        if (!password) {
            showToast('Please enter your password.', 'warning');
            document.getElementById('loginPassword')?.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
        }

        try {
            const res = await API.post('/login', { username, password });
            if (res && res.success && res.user) {
                state.activeUserId = res.user.id;
                localStorage.setItem('spendwise_user_id', res.user.id);
                showToast(res.message || `Welcome back, ${res.user.name}!`, 'success');
                if (typeof confetti === 'function') {
                    try { confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } }); } catch(err){}
                }
                await loadAllData();
                showMainApp();
                if (res.user.role === 'admin') switchTab('admin');
            } else {
                showToast(res?.message || 'Invalid username or password. Please try again.', 'error');
            }
        } catch(err) {
            console.error('Sign in error:', err);
            showToast('Sign in failed. Please try again.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
            }
        }
    });

    // Admin Sign In Modal & Trigger Listeners (kept for backward compat, but main flow uses form)
    document.getElementById('btnAdminSignInTrigger')?.addEventListener('click', () => {
        promptAdminLogin();
    });

    document.getElementById('formAdminModalLogin')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminLoginUsername')?.value?.trim();
        const password = document.getElementById('adminLoginPassword')?.value?.trim();
        if (!username || !password) {
            showToast('Please enter both Admin Username and Password.', 'warning');
            return;
        }
        await loginAsAdmin(username, password);
    });

    // Quick Demo Login Button (Demo as Siya - bypasses password for demo)
    document.getElementById('btnQuickDemoLogin')?.addEventListener('click', async () => {
        await loginAsUser(3); // Siya is ID 3 - demo bypass
    });

    // Logout Handlers
    document.getElementById('btnLogout')?.addEventListener('click', logoutUser);
    document.getElementById('btnSidebarLogout')?.addEventListener('click', logoutUser);
    document.getElementById('btnDrawerLogout')?.addEventListener('click', logoutUser);
}

// Prompt for Admin login modal
function promptAdminLogin(userId) {
    const usernameInput = document.getElementById('adminLoginUsername');
    const passInput = document.getElementById('adminLoginPassword');
    // Clear both fields - admin must enter credentials themselves
    if (usernameInput) usernameInput.value = '';
    if (passInput) {
        passInput.value = '';
    }
    // Focus username first
    setTimeout(() => (usernameInput || passInput)?.focus(), 150);
    openModal('modalAdminLogin');
}

// Admin login with Username & Password
async function loginAsAdmin(username, password) {
    try {
        const res = await API.post('/login', { username, password });
        if (res && res.success && res.user) {
            state.activeUserId = res.user.id;
            localStorage.setItem('spendwise_user_id', res.user.id);
            closeModal('modalAdminLogin');
            showToast(res.message || `Welcome Admin Manager ${res.user.name}! Access Granted.`, 'success');
            if (typeof confetti === 'function') {
                try { confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } }); } catch(e){}
            }
            await loadAllData();
            showMainApp();
            switchTab('admin');
        } else {
            showToast(res?.message || 'Invalid Admin Username or Password! Access denied.', 'error');
        }
    } catch (err) {
        console.error('Admin login error:', err);
        showToast('Invalid Admin Username or Password! Access denied.', 'error');
    }
}

// Load registered profiles list for Sign In tab
async function loadUserProfilesGrid() {
    const grid = document.getElementById('userProfilesGrid');
    if (!grid) return;

    grid.innerHTML = `<div class="text-muted text-center" style="padding:1rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading profiles...</div>`;
    const res = await API.get('/users');
    if (res && res.success && res.users) {
        if (res.users.length === 0) {
            grid.innerHTML = `<div class="text-muted text-center" style="padding:1rem;">No saved accounts found. Create a new account!</div>`;
            return;
        }

        grid.innerHTML = res.users.map(u => {
            const roleBadgeClass = u.role === 'admin' ? 'role-badge-admin' : (u.role === 'parent' ? 'role-badge-parent' : 'role-badge-teen');
            const roleLabel = u.role ? u.role.toUpperCase() : 'TEEN';

            return `
                <div class="profile-select-card" onclick="prefillLoginUsername('${escapeHtml(u.username || u.name)}')"
                     title="Click to pre-fill username, then enter your password">
                    <div class="profile-info">
                        <span class="profile-icon">${u.avatar || '🎯'}</span>
                        <div>
                            <div class="flex-align-gap">
                                <span class="profile-name">${escapeHtml(u.name)}</span>
                                <span class="role-badge-pill ${roleBadgeClass}">${roleLabel}</span>
                            </div>
                            <span class="profile-meta">@${escapeHtml(u.username || u.name)} &bull; Level ${u.level || 1}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-user-check text-muted" style="color:#a5b4fc;"></i>
                </div>
            `;
        }).join('');
    }
}

// Login as specific user ID
async function loginAsUser(userId) {
    try {
        const usersList = state.allUsers || [];
        const targetUser = usersList.find(u => u.id === userId);
        if (targetUser && targetUser.role === 'admin') {
            promptAdminLogin(userId);
            return;
        }

        state.activeUserId = userId;
        localStorage.setItem('spendwise_user_id', userId);
        const res = await API.post('/login', { user_id: userId });
        if (res && res.success) {
            showToast(res.message || 'Logged in!', 'success');
            await loadAllData();
            showMainApp();
        } else {
            // Fallback: If user ID requested fails, attempt fetching available accounts
            const usersRes = await API.get('/users');
            if (usersRes && usersRes.users && usersRes.users.length > 0) {
                const fallbackUser = usersRes.users.find(u => u.id === userId) || usersRes.users[0];
                state.activeUserId = fallbackUser.id;
                localStorage.setItem('spendwise_user_id', fallbackUser.id);
                showToast(`Logged in as ${fallbackUser.name}!`, 'success');
                await loadAllData();
                showMainApp();
            } else {
                showToast('User profile not found. Please create an account!', 'warning');
            }
        }
    } catch(err) {
        console.error('Login error:', err);
        showToast('Login failed. Please try creating a new account.', 'error');
    }
}

// Show Login Screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appMainContainer').style.display = 'none';
}

// Show Main App Screen
function showMainApp() {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appMainContainer');
    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    // Ensure overview tab is active on load
    switchTab(state.activeTab || 'overview');
}

// Logout User
function logoutUser() {
    localStorage.removeItem('spendwise_user_id');
    state.activeUserId = null;
    state.user = null;
    showToast('Logged out cleanly.', 'info');
    showLoginScreen();
}

// Load all API endpoints concurrently for active user
async function loadAllData() {
    if (!state.activeUserId) return false;

    const [userRes, statsRes, expRes, goalsRes, impulseRes, chRes, quizRes, adminRes] = await Promise.all([
        API.get('/user'),
        API.get('/stats'),
        API.get('/expenses'),
        API.get('/goals'),
        API.get('/should-i-buy'),
        API.get('/challenges'),
        API.get('/quizzes'),
        API.get('/admin/all-data')
    ]);

    if (!userRes || !userRes.success) return false;

    if (userRes && userRes.success) state.user = userRes.user;
    if (statsRes && statsRes.success) state.stats = statsRes.stats;
    if (expRes && expRes.success) state.expenses = expRes.expenses;
    if (goalsRes && goalsRes.success) state.goals = goalsRes.goals;
    if (impulseRes && impulseRes.success) state.impulseItems = impulseRes.items;
    if (chRes && chRes.success) state.challenges = chRes.challenges;
    if (quizRes && quizRes.success) state.quizzes = quizRes.quizzes;

    if (adminRes && adminRes.success) {
        state.allUsers = adminRes.users || [];
        state.allExpenses = adminRes.expenses || [];
    }

    renderAllViews();
    return true;
}

// Master Render Function
function renderAllViews() {
    const fns = [
        renderHeaderAndUser,
        renderOnboardingGuide,
        renderHeroAllowanceCard,
        renderMoneyCoachCard,
        renderSpendingOverviewCard,
        renderGoalSpotlightCard,
        renderImpulseSpotlightCard,
        renderXPLevelCard,
        renderOverviewExpenseTable,
        renderExpensesView,
        renderGoalsView,
        renderImpulseView,
        renderQuestsView,
        renderProfileView,
        renderParentView,
        renderAdminView
    ];

    fns.forEach(fn => {
        try {
            fn();
        } catch (err) {
            console.warn(`Error executing ${fn.name}:`, err);
        }
    });
}

// STEP-BY-STEP GUIDED ONBOARDING ENGINE
function renderOnboardingGuide() {
    const banner = document.getElementById('onboardingBanner');
    if (!banner) return;

    const expCount = state.expenses ? state.expenses.length : 0;
    const goalCount = state.goals ? state.goals.length : 0;
    const impulseCount = state.impulseItems ? state.impulseItems.length : 0;
    const quizDone = state.quizzes ? state.quizzes.some(q => q.attempted) : false;

    let step = 1;
    let badgeText = "Step 1 of 4";
    let title = "Track Your First Expense!";
    let desc = "Click the <strong>+ Add Expense</strong> button to record your first purchase.";
    let btnLabel = "Add Expense";
    let action = () => openModal('modalExpense');

    if (expCount === 0) {
        step = 1;
    } else if (goalCount === 0) {
        step = 2;
        badgeText = "Step 2 of 4";
        title = "Set Your First Savings Goal!";
        desc = "Click <strong>Savings Goals</strong> tab and set a target for an item you really want.";
        btnLabel = "Create Goal";
        action = () => {
            document.querySelector('[data-tab="goals"]')?.click();
            openModal('modalGoal');
        };
    } else if (impulseCount === 0) {
        step = 3;
        badgeText = "Step 3 of 4";
        title = "Test the 48-Hour Impulse Evaluator!";
        desc = "Prevent impulse spending by testing something you want to buy on a 48h pause timer.";
        btnLabel = "Test 48h Pause";
        action = () => {
            document.querySelector('[data-tab="impulse"]')?.click();
            openModal('modalImpulse');
        };
    } else if (!quizDone) {
        step = 4;
        badgeText = "Step 4 of 4";
        title = "Take Your First MoneyQuest Quiz!";
        desc = "Level up your financial IQ and earn XP by completing your first scenario quiz.";
        btnLabel = "Play Quests";
        action = () => document.querySelector('[data-tab="learn"]')?.click();
    } else {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'flex';
    document.getElementById('onboardingStepBadge').textContent = badgeText;
    document.getElementById('onboardingStepTitle').textContent = title;
    document.getElementById('onboardingStepDesc').innerHTML = desc;
    document.getElementById('onboardingActionLabel').textContent = btnLabel;

    const actionBtn = document.getElementById('onboardingActionBtn');
    if (actionBtn) actionBtn.onclick = action;
}

// Level Title Helper
function getLevelTitle(level) {
    const titles = {
        1: 'Budget Rookie',
        2: 'Smart Spender',
        3: 'Money Explorer',
        4: 'Savings Starter',
        5: 'Finance Pro'
    };
    return titles[level] || 'Finance Master';
}

function getDaysRemainingInMonth() {
    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(1, totalDays - now.getDate());
}

// Render User Header, Sidebar & Mobile Drawer Info
function renderHeaderAndUser() {
    if (!state.user) return;

    const userRole = state.user.role || 'teen';
    const roleIcon = userRole === 'admin' ? '👑 Admin' : (userRole === 'parent' ? '🛡️ Parent' : '🎯 Teen');

    // Header Role Badge
    const headerRoleBadge = document.getElementById('headerRoleBadge');
    if (headerRoleBadge) headerRoleBadge.textContent = roleIcon;

    // Show/Hide Role-based Nav Menu Items
    const navAdmin = document.getElementById('nav-admin');
    const drawerNavAdmin = document.getElementById('drawer-nav-admin');
    const navParent = document.getElementById('nav-parent');
    if (navAdmin) navAdmin.style.display = (userRole === 'admin') ? 'flex' : 'none';
    if (drawerNavAdmin) drawerNavAdmin.style.display = (userRole === 'admin') ? 'flex' : 'none';
    if (navParent) navParent.style.display = (userRole === 'parent' || userRole === 'admin') ? 'flex' : 'none';

    // Sidebar User Box
    const sidebarName = document.getElementById('sidebarUserName');
    if (sidebarName) sidebarName.textContent = state.user.name;

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) userAvatar.textContent = state.user.avatar || '🎯';

    const levelTitle = getLevelTitle(state.user.level);
    const userBadge = document.getElementById('userLevelBadge');
    if (userBadge) userBadge.innerHTML = `<i class="fa-solid fa-bolt"></i> Level ${state.user.level} • ${levelTitle}`;

    // Mobile Drawer User Box
    const drawerAvatar = document.getElementById('drawerUserAvatar');
    if (drawerAvatar) drawerAvatar.textContent = state.user.avatar || '🎯';

    const drawerName = document.getElementById('drawerUserName');
    if (drawerName) drawerName.textContent = state.user.name;

    const drawerBadge = document.getElementById('drawerUserBadge');
    if (drawerBadge) drawerBadge.textContent = `Level ${state.user.level} • ${levelTitle}`;

    // XP Bar (200 XP per level)
    const currentLevelBase = (state.user.level - 1) * 200;
    const nextLevelTarget = state.user.level * 200;
    const progressXP = Math.max(0, state.user.points - currentLevelBase);
    const xpPercent = Math.min(100, Math.max(0, (progressXP / 200) * 100));

    const xpBar = document.getElementById('xpBarFill');
    if (xpBar) xpBar.style.width = `${xpPercent}%`;
    const xpCur = document.getElementById('xpCurrent');
    if (xpCur) xpCur.textContent = `${state.user.points} XP`;
    const xpNext = document.getElementById('xpNext');
    if (xpNext) xpNext.textContent = `${nextLevelTarget} XP`;

    // Top Header Pills
    const streak = document.getElementById('streakCount');
    if (streak) streak.textContent = state.user.streak;
    const pts = document.getElementById('headerPoints');
    if (pts) pts.textContent = state.user.points;
}

// 1. Render Hero Allowance Banner
function renderHeroAllowanceCard() {
    const el = document.getElementById('heroAllowanceCard');
    if (!el || !state.stats) return;

    const stats = state.stats;
    const pocketMoney = stats.pocket_money || 0;

    if (pocketMoney <= 0) {
        el.innerHTML = `
            <div class="allowance-onboarding-card">
                <div class="onboarding-text-group">
                    <div class="onboarding-badge"><i class="fa-solid fa-sparkles text-amber"></i> Quick Onboarding</div>
                    <h2 class="onboarding-title">Let's get your money set up</h2>
                    <p class="onboarding-desc">Add your monthly pocket money to start tracking spending and unlock smart insights.</p>
                </div>
                <button class="btn-primary btn-lg" onclick="openModal('modalProfile')">
                    <i class="fa-solid fa-plus"></i> Set my allowance
                </button>
            </div>
        `;
    } else {
        const daysLeft = getDaysRemainingInMonth();
        const now = new Date();
        const currentDay = now.getDate();
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const monthRatio = currentDay / totalDays;
        const spentRatio = stats.spent_total / pocketMoney;

        let paceBadgeText = "🔥 You're spending slower than usual";
        let paceClass = "pace-ahead";

        if (spentRatio > monthRatio + 0.1) {
            paceBadgeText = "⚠️ Spending faster than planned pace";
            paceClass = "pace-warning";
        } else if (spentRatio >= monthRatio - 0.05) {
            paceBadgeText = "🎯 On track with monthly budget pace";
            paceClass = "pace-ontrack";
        }

        const balanceFormatted = (stats.balance || 0).toLocaleString('en-IN');
        const spentFormatted = (stats.spent_total || 0).toLocaleString('en-IN');
        const pocketFormatted = pocketMoney.toLocaleString('en-IN');

        el.innerHTML = `
            <div class="allowance-active-card">
                <div class="allowance-top-row">
                    <div class="allowance-val-group">
                        <span class="allowance-meta-label">Available Allowance</span>
                        <div class="allowance-amount-large">
                            ₹${balanceFormatted} <span class="allowance-unit-text">LEFT</span>
                        </div>
                    </div>
                    <div class="allowance-pace-pill ${paceClass}">
                        ${paceBadgeText}
                    </div>
                </div>

                <div class="allowance-progress-container">
                    <div class="allowance-progress-fill" style="width: ${stats.spent_percent}%;"></div>
                </div>

                <div class="allowance-bottom-row">
                    <span>Spent: <strong>₹${spentFormatted}</strong> of ₹${pocketFormatted} (${stats.spent_percent}%)</span>
                    <span><strong>${daysLeft} days</strong> remaining this month</span>
                </div>
            </div>
        `;
    }
}

// 2. Render Money Coach Insight Card
function renderMoneyCoachCard() {
    const el = document.getElementById('moneyCoachCard');
    if (!el || !state.stats) return;

    const stats = state.stats;
    const spentPct = stats.spent_percent;

    let coachEmoji = "🤖";
    let coachTitle = "Money Coach Tip";
    let coachMsg = "Tracking every single purchase helps you discover where small leaks occur. Keep it up!";
    let actionBtnHTML = `<button class="btn-secondary btn-sm" onclick="openModal('modalImpulse')">Try Purchase Pause</button>`;

    if (spentPct === 0) {
        coachTitle = "Fresh Start!";
        coachMsg = "No expenses recorded yet. Click + Add Expense to track your very first pocket money expense!";
        actionBtnHTML = `<button class="btn-primary btn-sm" onclick="openModal('modalExpense')">+ Log First Expense</button>`;
    } else if (spentPct > 75) {
        coachEmoji = "⚠️";
        coachTitle = "Allowance Alert";
        coachMsg = `You've used ${spentPct}% of your pocket money! Pause non-essential purchases and rely on free outings.`;
        actionBtnHTML = `<button class="btn-danger btn-sm" onclick="openModal('modalImpulse')">Pause Purchases</button>`;
    } else if (state.goals.length === 0) {
        coachTitle = "Set a Savings Target";
        coachMsg = "You don't have an active savings goal yet! Setting a goal keeps your money focused.";
        actionBtnHTML = `<button class="btn-primary btn-sm" onclick="openModal('modalGoal')">+ Create Goal</button>`;
    }

    el.innerHTML = `
        <div class="card-header">
            <div class="flex-align-gap">
                <span class="card-avatar-icon">${coachEmoji}</span>
                <h3>${coachTitle}</h3>
            </div>
        </div>
        <p class="card-body-text">${coachMsg}</p>
        <div class="card-footer-action">
            ${actionBtnHTML}
        </div>
    `;
}

// 3. Render Spending Overview & Chart
function renderSpendingOverviewCard() {
    const el = document.getElementById('spendingOverviewCard');
    if (!el) return;

    el.innerHTML = `
        <div class="card-header">
            <h3><i class="fa-solid fa-chart-pie text-emerald"></i> Spending Breakdown</h3>
        </div>
        <div class="chart-container-box">
            <canvas id="spendingDoughnutChart"></canvas>
        </div>
    `;

    renderSpendingChart();
}

function renderSpendingChart() {
    try {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js CDN is not loaded. Skipping chart rendering.');
            return;
        }
        const canvas = document.getElementById('spendingDoughnutChart');
        if (!canvas) return;

        if (state.chartInstance) {
            state.chartInstance.destroy();
            state.chartInstance = null;
        }

        const categories = ['Food', 'Outings', 'Tech', 'Entertainment', 'Shopping', 'Hobbies'];
        const categoryTotals = categories.map(cat => {
            return (state.expenses || [])
                .filter(e => e.category === cat)
                .reduce((acc, cur) => acc + (cur.amount || 0), 0);
        });

        const hasData = categoryTotals.some(v => v > 0);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        state.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: hasData ? categories : ['No Expenses Yet'],
                datasets: [{
                    data: hasData ? categoryTotals : [1],
                    backgroundColor: hasData ? [
                        '#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6'
                    ] : ['rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                    }
                },
                cutout: '70%'
            }
        });
    } catch (err) {
        console.warn('Error in renderSpendingChart:', err);
    }
}

// 4. Render Savings Goal Spotlight Card
function renderGoalSpotlightCard() {
    const el = document.getElementById('goalSpotlightCard');
    if (!el) return;

    if (state.goals.length === 0) {
        el.innerHTML = `
            <div class="card-header">
                <h3><i class="fa-solid fa-bullseye text-cyan"></i> Savings Target Spotlight</h3>
            </div>
            <div class="empty-spotlight-box">
                <p class="text-muted">No active savings goal set.</p>
                <button class="btn-primary btn-sm margin-top-xs" onclick="openModal('modalGoal')">+ Set Target Goal</button>
            </div>
        `;
        return;
    }

    const topGoal = state.goals[0];
    const percent = Math.min(100, Math.round((topGoal.current_amount / topGoal.target_amount) * 100));

    el.innerHTML = `
        <div class="card-header">
            <div class="flex-align-gap">
                <span style="font-size:1.5rem;">${topGoal.icon || '🎯'}</span>
                <h3>${escapeHtml(topGoal.title)}</h3>
            </div>
            <span class="badge-tag">${percent}%</span>
        </div>
        <div class="goal-progress-box margin-top-xs">
            <div class="goal-progress-text">
                <span>Saved ₹${topGoal.current_amount.toLocaleString('en-IN')}</span>
                <span>Target: ₹${topGoal.target_amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="goal-bar-bg">
                <div class="goal-bar-fill" style="width: ${percent}%;"></div>
            </div>
        </div>
        <div class="margin-top-xs">
            <button class="btn-primary btn-full btn-sm" onclick="openDepositModal(${topGoal.id})">
                <i class="fa-solid fa-piggy-bank"></i> Deposit Savings
            </button>
        </div>
    `;
}

// 5. Render Impulse Spotlight Card
function renderImpulseSpotlightCard() {
    const el = document.getElementById('impulseSpotlightCard');
    if (!el) return;

    const pending = state.impulseItems.filter(i => i.status === 'pending');

    if (pending.length === 0) {
        el.innerHTML = `
            <div class="card-header">
                <h3><i class="fa-solid fa-hourglass-half text-purple"></i> 48h Impulse Guard</h3>
            </div>
            <div class="empty-spotlight-box">
                <p class="text-muted">No items currently on 48h cool-off timer.</p>
                <button class="btn-secondary btn-sm margin-top-xs" onclick="openModal('modalImpulse')">Test Purchase Pause</button>
            </div>
        `;
        return;
    }

    const item = pending[0];
    el.innerHTML = `
        <div class="card-header">
            <h3><i class="fa-solid fa-hourglass-half text-purple"></i> Impulse Pause: ${escapeHtml(item.item_name)}</h3>
            <span class="badge-tag">₹${item.price}</span>
        </div>
        <div class="timer-box margin-top-xs">
            <div class="text-muted" style="font-size: 0.72rem;">Cool-off Remaining:</div>
            <span class="timer-val countdown-timer" data-until="${item.cooldown_until}">Calculating...</span>
        </div>
        <button class="btn-primary btn-full btn-sm margin-top-xs" onclick="openResolveModal(${item.id})">
            <i class="fa-solid fa-check"></i> Reflect & Decide
        </button>
    `;
}

// 6. Render XP Level Card
function renderXPLevelCard() {
    const el = document.getElementById('xpLevelCard');
    if (!el || !state.user) return;

    const user = state.user;
    const currentLevelBase = (user.level - 1) * 200;
    const progressXP = Math.max(0, user.points - currentLevelBase);
    const xpPercent = Math.min(100, Math.max(0, (progressXP / 200) * 100));

    el.innerHTML = `
        <div class="xp-level-inner">
            <div class="xp-header-row">
                <div>
                    <span class="badge-tag text-indigo"><i class="fa-solid fa-bolt"></i> LEVEL ${user.level}</span>
                    <h3 style="margin-top:0.3rem;">${getLevelTitle(user.level)}</h3>
                </div>
                <div class="xp-points-display">
                    <i class="fa-solid fa-star text-amber"></i> ${user.points} XP
                </div>
            </div>
            <div class="xp-bar-container-lg margin-top-xs">
                <div class="xp-bar-fill-lg" style="width: ${xpPercent}%;"></div>
            </div>
            <div class="xp-meta-row margin-top-xs">
                <span>Progress: ${progressXP} / 200 XP to Level ${user.level + 1}</span>
                <span>Streak: 🔥 ${user.streak} Days</span>
            </div>
        </div>
    `;
}

// 7. Render Overview Expense Table
function renderOverviewExpenseTable() {
    const tbody = document.getElementById('overviewExpenseTable');
    if (!tbody) return;

    const recent = state.expenses.slice(0, 5);
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-muted text-center" style="padding: 1.5rem;">No expenses logged yet! Click + Add Expense to start tracking.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(e => `
        <tr>
            <td>
                <strong>${escapeHtml(e.title)}</strong><br>
                <span class="category-tag">${getCategoryEmoji(e.category)} ${escapeHtml(e.category)}</span>
            </td>
            <td>${e.date}</td>
            <td class="text-muted">${escapeHtml(e.description || '-')}</td>
            <td class="text-right">
                <strong>₹${e.amount.toLocaleString('en-IN')}</strong>
                <button class="btn-delete-item margin-left-xs" onclick="deleteExpense(${e.id})" title="Delete expense">&times;</button>
            </td>
        </tr>
    `).join('');
}

// Render Expenses Tab View
function renderExpensesView() {
    const tbody = document.getElementById('fullExpenseTable');
    if (!tbody) return;

    let filtered = state.expenses;
    if (state.expenseCategoryFilter !== 'ALL') {
        filtered = filtered.filter(e => e.category === state.expenseCategoryFilter);
    }

    const totalSpent = filtered.reduce((acc, cur) => acc + cur.amount, 0);
    const avgSpent = filtered.length > 0 ? (totalSpent / filtered.length) : 0;

    document.getElementById('expensesViewTotal').textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
    document.getElementById('expensesViewAvg').textContent = `₹${Math.round(avgSpent).toLocaleString('en-IN')}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state-box">
                        <div class="empty-state-icon">🧾</div>
                        <h4 class="empty-state-title">No Expenses Logged Yet</h4>
                        <p class="empty-state-desc">Record where your pocket money goes to build your budget history.</p>
                        <button class="btn-primary" onclick="openModal('modalExpense')">+ Record New Expense</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(e => `
        <tr>
            <td>${e.date}</td>
            <td><strong>${escapeHtml(e.title)}</strong></td>
            <td><span class="category-tag">${getCategoryEmoji(e.category)} ${escapeHtml(e.category)}</span></td>
            <td class="text-muted">${escapeHtml(e.description || '-')}</td>
            <td class="text-right">
                <strong>₹${e.amount.toLocaleString('en-IN')}</strong>
                <button class="btn-delete-item margin-left-xs" onclick="deleteExpense(${e.id})" title="Delete expense">&times;</button>
            </td>
        </tr>
    `).join('');
}

// Delete Expense Handler
async function deleteExpense(id) {
    if (confirm('Delete this expense? The amount will be refunded to your balance.')) {
        const res = await API.post('/expenses/delete', { id });
        if (res && res.success) {
            showToast(res.message, 'info');
            await loadAllData();
        }
    }
}

// Render Savings Goals Tab View
function renderGoalsView() {
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;

    if (state.goals.length === 0) {
        grid.innerHTML = `
            <div class="full-width-card">
                <div class="empty-state-box">
                    <div class="empty-state-icon">🎯</div>
                    <h4 class="empty-state-title">No Savings Goals Set</h4>
                    <p class="empty-state-desc">Give your savings a target! Allocate pocket money towards items you really want.</p>
                    <button class="btn-primary" onclick="openModal('modalGoal')">+ Create Savings Goal</button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = state.goals.map(g => {
        const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
        const isCompleted = g.status === 'completed' || percent >= 100;

        return `
            <div class="goal-card">
                <div>
                    <div class="goal-header">
                        <div class="goal-icon">${g.icon || '🎯'}</div>
                        <div class="goal-details">
                            <h4>${escapeHtml(g.title)}</h4>
                            <p>${escapeHtml(g.category)} ${g.deadline ? '• Deadline: ' + g.deadline : ''}</p>
                        </div>
                        <button class="btn-delete-item" onclick="deleteGoal(${g.id})" title="Delete Goal">&times;</button>
                    </div>
                    <div class="goal-progress-box">
                        <div class="goal-progress-text">
                            <span>Saved ₹${g.current_amount.toLocaleString('en-IN')}</span>
                            <span>Target: ₹${g.target_amount.toLocaleString('en-IN')} (${percent}%)</span>
                        </div>
                        <div class="goal-bar-bg">
                            <div class="goal-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                </div>
                <div>
                    ${isCompleted ? `
                        <div class="btn-success btn-full text-center" style="padding: 0.6rem;">
                            🎉 GOAL ACHIEVED!
                        </div>
                    ` : `
                        <button class="btn-primary btn-full" onclick="openDepositModal(${g.id})">
                            <i class="fa-solid fa-piggy-bank"></i> Deposit Savings
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Delete Goal Handler
async function deleteGoal(id) {
    if (confirm('Delete this savings goal? Saved money will be refunded to your available balance.')) {
        const res = await API.post('/goals/delete', { id });
        if (res && res.success) {
            showToast(res.message, 'info');
            await loadAllData();
        }
    }
}

// Render Impulse Tool Tab View
function renderImpulseView() {
    const grid = document.getElementById('impulseGrid');
    if (!grid) return;

    if (state.impulseItems.length === 0) {
        grid.innerHTML = `
            <div class="full-width-card">
                <div class="empty-state-box">
                    <div class="empty-state-icon">🛡️</div>
                    <h4 class="empty-state-title">No Active Purchase Pauses</h4>
                    <p class="empty-state-desc">Test an item you want to buy on a 48-hour cool-off timer to prevent impulse buying.</p>
                    <button class="btn-primary" onclick="openModal('modalImpulse')">+ Test 48-Hour Pause</button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = state.impulseItems.map(item => {
        const isPending = item.status === 'pending';
        const isSaved = item.decision === 'saved';

        return `
            <div class="impulse-card ${isPending ? 'status-pending' : ''}">
                <div class="card-header">
                    <h4>${escapeHtml(item.item_name)}</h4>
                    <div>
                        <span class="badge-tag">₹${item.price}</span>
                        <button class="btn-delete-item margin-left-xs" onclick="deleteImpulseItem(${item.id})" title="Delete Item">&times;</button>
                    </div>
                </div>
                <p class="text-muted">
                    <span class="category-tag">${item.is_need ? 'NEED' : 'WANT'}</span> • Usage: ${escapeHtml(item.usage_freq)}
                </p>

                ${isPending ? `
                    <div class="timer-box">
                        <div class="text-muted" style="font-size: 0.72rem;">Cool-off Time Remaining:</div>
                        <span class="timer-val countdown-timer" data-until="${item.cooldown_until}">Calculating...</span>
                    </div>
                    <button class="btn-primary btn-full btn-sm" onclick="openResolveModal(${item.id})">
                        <i class="fa-solid fa-check"></i> Reflect & Make Final Choice
                    </button>
                ` : `
                    <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                        <strong class="${isSaved ? 'text-emerald' : 'text-muted'}">
                            ${isSaved ? '🏆 SAVED MONEY! (+150 XP)' : '🛒 Bought as Planned Expense'}
                        </strong>
                        <p class="text-muted" style="font-size: 0.78rem; margin-top: 0.3rem;">
                            ${escapeHtml(item.reflection_notes || '')}
                        </p>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// Delete Impulse Item Handler
async function deleteImpulseItem(id) {
    if (confirm('Remove this impulse evaluation item?')) {
        const res = await API.post('/should-i-buy/delete', { id });
        if (res && res.success) {
            showToast(res.message, 'info');
            await loadAllData();
        }
    }
}

// Arcade Trivia Game State Initialization
state.arcade = {
    currentLevel: 1,
    timerSeconds: 15,
    timerInterval: null,
    streak: 0,
    maxStreak: 0,
    score: 0,
    totalXPRound: 0,
    lifeline5050Used: false,
    lifelineHintUsed: false,
    isAnswered: false
};

// Render Quests & Cyber Arcade Trivia Arena
function renderQuestsView() {
    const chList = document.getElementById('challengesList');
    if (chList) {
        chList.innerHTML = state.challenges.map(ch => `
            <div class="challenge-card">
                <div class="challenge-row">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem;">${escapeHtml(ch.title)}</h4>
                        <p class="text-muted" style="margin: 0 0 0.5rem 0; font-size: 0.82rem; line-height: 1.4;">${escapeHtml(ch.description)}</p>
                        <span class="badge-tag text-amber"><i class="fa-solid fa-star"></i> +${ch.points_reward} XP Reward</span>
                    </div>
                    <div style="flex-shrink: 0; margin-left: 1rem;">
                        ${ch.is_completed ? `
                            <span class="claimed-badge"><i class="fa-solid fa-circle-check"></i> Claimed</span>
                        ` : `
                            <button class="btn-primary btn-sm" onclick="claimChallenge(${ch.id})">Claim Reward</button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderArcadeTriviaQuestion();
}

function renderArcadeTriviaQuestion() {
    const totalLevels = QuizEngine.getTotalCount();
    if (state.arcade.currentLevel > totalLevels) {
        showVictoryCelebrationModal();
        return;
    }

    const q = QuizEngine.getQuizByLevel(state.arcade.currentLevel);
    state.arcade.isAnswered = false;

    const currentLvl = state.arcade.currentLevel;
    const progressPercent = Math.min(100, Math.max(1, (currentLvl / totalLevels) * 100));

    // Update HUD Header Elements
    const hudLevelNum = document.getElementById('hudLevelNum');
    const hudTotalLevels = document.getElementById('hudTotalLevels');
    const hudTierName = document.getElementById('hudTierName');
    const sideTotalLevels = document.getElementById('sideTotalLevels');
    const sideCompleted = document.getElementById('sideCompletedLevels');
    const sideCurrentTier = document.getElementById('sideCurrentTier');

    if (hudLevelNum) hudLevelNum.textContent = currentLvl;
    if (hudTotalLevels) hudTotalLevels.textContent = totalLevels.toLocaleString('en-IN');

    const tierInfo = QuizEngine.getTier(currentLvl);
    if (hudTierName) hudTierName.textContent = `${tierInfo.icon} ${tierInfo.name}`;
    if (sideTotalLevels) sideTotalLevels.textContent = totalLevels.toLocaleString('en-IN');
    if (sideCompleted) sideCompleted.textContent = (currentLvl - 1).toLocaleString('en-IN');
    if (sideCurrentTier) sideCurrentTier.textContent = `Tier ${tierInfo.id}: ${tierInfo.name}`;

    const progText = document.getElementById('arcadeProgressText');
    const progBar = document.getElementById('arcadeProgressBar');
    if (progText) progText.textContent = `LEVEL ${currentLvl} / ${totalLevels.toLocaleString('en-IN')}`;
    if (progBar) progBar.style.width = `${progressPercent}%`;

    // Boss Battle Banner Check
    const bossBanner = document.getElementById('cyberBossBanner');
    if (bossBanner) {
        if (q.is_boss) {
            bossBanner.style.display = 'flex';
            document.getElementById('bossLevelNum').textContent = currentLvl;
            document.getElementById('bossNameText').textContent = q.title.toUpperCase();
        } else {
            bossBanner.style.display = 'none';
        }
    }

    const catMap = {
        'smart_shopping': 'Smart Shopping 🛒',
        'budgeting': 'Budgeting 💡',
        'saving_basics': 'Saving Basics 🌱',
        'mindset': 'Money Mindset 🧠',
        'investing': 'Stock Market & Index Funds 📈',
        'crypto_web3': 'Crypto & Web3 DeFi ⚡',
        'real_estate': 'Real Estate & Wealth 🏢',
        'tax_wealth': 'Tax & Sovereign Wealth 🏛️'
    };
    const catBadge = document.getElementById('arcadeCategoryBadge');
    const qTitle = document.getElementById('arcadeQuestionTitle');
    const xpTag = document.getElementById('arcadeXPTag');

    if (catBadge) catBadge.textContent = catMap[q.category] || 'Financial IQ';
    if (qTitle) qTitle.textContent = q.scenario;
    if (xpTag) xpTag.textContent = `+${q.points_reward} XP`;

    const optionsGrid = document.getElementById('arcadeOptionsGrid');
    if (optionsGrid) {
        optionsGrid.innerHTML = `
            <button class="arcade-option-tile" id="tile-opt-1" onclick="handleArcadeAnswer(1, this)">
                <span class="tile-letter-badge">A</span>
                <span class="tile-option-text">${escapeHtml(q.option_a)}</span>
            </button>
            <button class="arcade-option-tile" id="tile-opt-2" onclick="handleArcadeAnswer(2, this)">
                <span class="tile-letter-badge">B</span>
                <span class="tile-option-text">${escapeHtml(q.option_b)}</span>
            </button>
            <button class="arcade-option-tile" id="tile-opt-3" onclick="handleArcadeAnswer(3, this)">
                <span class="tile-letter-badge">C</span>
                <span class="tile-option-text">${escapeHtml(q.option_c)}</span>
            </button>
            <button class="arcade-option-tile" id="tile-opt-4" onclick="handleArcadeAnswer(4, this)">
                <span class="tile-letter-badge">D</span>
                <span class="tile-option-text">${escapeHtml(q.option_d)}</span>
            </button>
        `;
    }

    const hintBox = document.getElementById('arcadeHintBox');
    if (hintBox) hintBox.style.display = 'none';

    // Reset lifelines UI for new question if not used
    const btn5050 = document.getElementById('btnLifeline5050');
    if (btn5050 && !state.arcade.lifeline5050Used) {
        btn5050.disabled = false;
        btn5050.classList.remove('used');
    }
    const btnHint = document.getElementById('btnLifelineHint');
    if (btnHint && !state.arcade.lifelineHintUsed) {
        btnHint.disabled = false;
        btnHint.classList.remove('used');
    }

    startArcadeQuestionTimer();
}

function startArcadeQuestionTimer() {
    if (state.arcade.timerInterval) clearInterval(state.arcade.timerInterval);
    state.arcade.timerSeconds = 15;

    const timerText = document.getElementById('arcadeTimerText');
    const timerCircle = document.getElementById('timerRingCircle');
    const totalDash = 144.5;

    if (timerText) timerText.textContent = '15s';
    if (timerCircle) {
        timerCircle.style.strokeDashoffset = '0';
        timerCircle.style.stroke = 'var(--accent-emerald)';
    }

    state.arcade.timerInterval = setInterval(() => {
        state.arcade.timerSeconds--;
        if (timerText) timerText.textContent = `${state.arcade.timerSeconds}s`;

        CyberAudioSynth.playTick();

        const fraction = (15 - state.arcade.timerSeconds) / 15;
        const offset = totalDash * fraction;
        if (timerCircle) {
            timerCircle.style.strokeDashoffset = offset;
            if (state.arcade.timerSeconds <= 5) {
                timerCircle.style.stroke = 'var(--accent-rose)';
            }
        }

        if (state.arcade.timerSeconds <= 0) {
            clearInterval(state.arcade.timerInterval);
            handleArcadeTimeout();
        }
    }, 1000);
}

// Handle Answer Selection
async function handleArcadeAnswer(selectedOpt, tileElement) {
    if (state.arcade.isAnswered) return;
    state.arcade.isAnswered = true;

    if (state.arcade.timerInterval) clearInterval(state.arcade.timerInterval);

    const q = QuizEngine.getQuizByLevel(state.arcade.currentLevel);
    const gameCard = document.getElementById('arcadeGameCard');

    const res = await API.post('/quizzes/submit', {
        quiz_id: q.id,
        selected_option: selectedOpt
    });

    const isCorrect = (selectedOpt === q.correct_option);

    if (isCorrect) {
        CyberAudioSynth.playCorrect();
        state.arcade.streak++;
        if (state.arcade.streak > state.arcade.maxStreak) {
            state.arcade.maxStreak = state.arcade.streak;
        }
        state.arcade.score++;

        let mult = 1.0;
        if (state.arcade.streak === 2) mult = 1.2;
        else if (state.arcade.streak === 3) mult = 1.5;
        else if (state.arcade.streak >= 4) mult = 2.0;

        const pointsGained = Math.round(q.points_reward * mult);
        state.arcade.totalXPRound += pointsGained;

        if (gameCard) gameCard.classList.add('correct-glow');
        if (tileElement) tileElement.classList.add('tile-correct');

        if (tileElement) spawnFloatingXP(tileElement, `+${pointsGained} XP ${mult > 1 ? `(${mult}x 🔥)` : ''}`);
        updateStreakBadge(mult);
    } else {
        CyberAudioSynth.playWrong();
        state.arcade.streak = 0;
        updateStreakBadge(1.0);

        if (gameCard) gameCard.classList.add('wrong-shake');
        if (tileElement) tileElement.classList.add('tile-wrong');

        const correctTile = document.getElementById(`tile-opt-${q.correct_option}`);
        if (correctTile) correctTile.classList.add('tile-correct');
    }

    setTimeout(() => {
        if (gameCard) gameCard.classList.remove('correct-glow', 'wrong-shake');
        state.arcade.currentLevel++;
        renderArcadeTriviaQuestion();
    }, 1300);
}

function handleArcadeTimeout() {
    if (state.arcade.isAnswered) return;
    state.arcade.isAnswered = true;

    CyberAudioSynth.playWrong();
    state.arcade.streak = 0;
    updateStreakBadge(1.0);

    const gameCard = document.getElementById('arcadeGameCard');
    const q = QuizEngine.getQuizByLevel(state.arcade.currentLevel);

    if (gameCard) gameCard.classList.add('wrong-shake');
    showToast('⏱️ Time expired for this level!', 'error');

    const correctTile = document.getElementById(`tile-opt-${q.correct_option}`);
    if (correctTile) correctTile.classList.add('tile-correct');

    setTimeout(() => {
        if (gameCard) gameCard.classList.remove('wrong-shake');
        state.arcade.currentLevel++;
        renderArcadeTriviaQuestion();
    }, 1300);
}

function triggerLifeline5050() {
    if (state.arcade.lifeline5050Used || state.arcade.isAnswered) return;
    state.arcade.lifeline5050Used = true;

    const btn = document.getElementById('btnLifeline5050');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('used');
    }

    const q = QuizEngine.getQuizByLevel(state.arcade.currentLevel);
    const correctOpt = q.correct_option;

    const wrongOpts = [1, 2, 3, 4].filter(num => num !== correctOpt);
    const toDisable = wrongOpts.sort(() => 0.5 - Math.random()).slice(0, 2);

    toDisable.forEach(optNum => {
        const tile = document.getElementById(`tile-opt-${optNum}`);
        if (tile) tile.classList.add('disabled-5050');
    });

    showToast('✂️ 50:50 Lifeline Used! 2 wrong choices eliminated.', 'info');
}

function triggerLifelineHint() {
    if (state.arcade.lifelineHintUsed || state.arcade.isAnswered) return;
    state.arcade.lifelineHintUsed = true;

    const btn = document.getElementById('btnLifelineHint');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('used');
    }

    const q = QuizEngine.getQuizByLevel(state.arcade.currentLevel);
    const hintBox = document.getElementById('arcadeHintBox');
    const hintText = document.getElementById('arcadeHintText');

    if (hintBox && hintText) {
        hintText.textContent = `Financial IQ Clue: ${q.explanation || 'Focus on distinguishing essential Needs from optional Wants!'}`;
        hintBox.style.display = 'flex';
    }

    showToast('💡 Hint Unlocked!', 'info');
}

function skipCurrentLevel() {
    if (state.arcade.isAnswered) return;
    showToast(`⚡ Skipped Level ${state.arcade.currentLevel}!`, 'info');
    state.arcade.currentLevel++;
    renderArcadeTriviaQuestion();
}

function jumpToLevel(lvlNum) {
    const target = parseInt(lvlNum);
    const total = QuizEngine.getTotalCount();
    if (isNaN(target) || target < 1 || target > total) {
        showToast(`Please enter a valid level between 1 and ${total}`, 'error');
        return;
    }
    state.arcade.currentLevel = target;
    showToast(`🚀 Warp Jumped to Level ${target}!`, 'success');
    renderArcadeTriviaQuestion();
}



function spawnFloatingXP(targetTile, text) {
    const pop = document.createElement('div');
    pop.className = 'floating-xp-pop';
    pop.textContent = text;

    const rect = targetTile.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.left = `${rect.left + rect.width / 2 - 40}px`;
    pop.style.top = `${rect.top - 10}px`;
    pop.style.zIndex = '9999';
    pop.style.pointerEvents = 'none';

    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
}

function updateStreakBadge(mult) {
    const badge = document.getElementById('arcadeStreakBadge');
    const text = document.getElementById('streakMultText');
    if (text) text.textContent = `${mult}x Streak`;
    if (badge) {
        if (mult > 1) badge.classList.add('boosted');
        else badge.classList.remove('boosted');
    }
}

function showVictoryCelebrationModal() {
    if (state.arcade.timerInterval) clearInterval(state.arcade.timerInterval);

    const totalQ = state.quizzes.length;
    const vScore = document.getElementById('victoryScore');
    const vStreak = document.getElementById('victoryStreak');
    const vXP = document.getElementById('victoryXP');

    if (vScore) vScore.textContent = `${state.arcade.score}/${totalQ}`;
    if (vStreak) vStreak.textContent = `${state.arcade.maxStreak > 0 ? state.arcade.maxStreak : 1}x`;
    if (vXP) vXP.textContent = `+${state.arcade.totalXPRound} XP`;

    if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    openModal('modalTriviaVictory');
}

// Render Profile & Badges View
function renderProfileView() {
    if (!state.user) return;

    const avatarEl = document.getElementById('profileBigAvatar');
    if (avatarEl) avatarEl.textContent = state.user.avatar || '🎯';

    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = state.user.name;

    const levelEl = document.getElementById('profileLevel');
    if (levelEl) levelEl.textContent = `Level ${state.user.level || 1}`;

    const xpEl = document.getElementById('profileXP');
    if (xpEl) xpEl.textContent = `${state.user.points || 0} XP`;

    const streakEl = document.getElementById('profileStreak');
    if (streakEl) streakEl.textContent = `${state.user.streak || 1} Days`;

    const grid = document.getElementById('badgesGrid');
    if (grid && state.user.badges) {
        if (state.user.badges.length === 0) {
            grid.innerHTML = `<div class="text-muted text-center" style="padding: 2rem;">No badges earned yet. Complete quests and impulse pauses to unlock your first badge!</div>`;
        } else {
            grid.innerHTML = state.user.badges.map(b => `
                <div class="badge-item-card">
                    <div class="badge-icon">${b.icon}</div>
                    <div class="badge-title">${escapeHtml(b.title)}</div>
                    <div class="badge-desc">${escapeHtml(b.description)}</div>
                </div>
            `).join('');
        }
    }
}

// 7. Render Parent Hub View
function renderParentView() {
    const teenGrid = document.getElementById('parentTeenGrid');
    const goalsMon = document.getElementById('parentGoalsMonitor');
    const impulseMon = document.getElementById('parentImpulseMonitor');

    if (!state.allUsers || state.allUsers.length === 0) return;

    const teens = state.allUsers.filter(u => u.role === 'teen' || !u.role);

    if (teenGrid) {
        if (teens.length === 0) {
            teenGrid.innerHTML = `<div class="text-muted text-center" style="padding:1.5rem;">No registered teen accounts found.</div>`;
        } else {
            teenGrid.innerHTML = teens.map(t => `
                <div class="parent-teen-card">
                    <div class="p-teen-header">
                        <div class="avatar-box">${t.avatar || '🎯'}</div>
                        <div>
                            <h4>${escapeHtml(t.name)}</h4>
                            <span class="role-badge-pill role-badge-teen">TEEN</span>
                        </div>
                    </div>
                    <div class="p-teen-stats">
                        <div>
                            <span class="lbl">Allowance Balance</span>
                            <span class="val text-emerald">₹${(t.balance || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                            <span class="lbl">Monthly Allowance</span>
                            <span class="val">₹${(t.pocket_money || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                            <span class="lbl">Rank Level</span>
                            <span class="val">Level ${t.level || 1} (${t.points || 0} XP)</span>
                        </div>
                    </div>
                    <button class="btn-primary btn-full btn-sm margin-top-xs" onclick="openParentTopupForUser(${t.id})">
                        <i class="fa-solid fa-coins"></i> Send Allowance / Chore Bonus
                    </button>
                </div>
            `).join('');
        }
    }

    if (goalsMon) {
        if (state.goals.length === 0) {
            goalsMon.innerHTML = `<p class="text-muted">No active savings goals found.</p>`;
        } else {
            goalsMon.innerHTML = state.goals.map(g => `
                <div class="monitor-row-item">
                    <div class="flex-align-gap">
                        <span>${g.icon || '🎯'}</span>
                        <div>
                            <strong>${escapeHtml(g.title)}</strong>
                            <div class="text-muted" style="font-size:0.75rem;">Saved ₹${g.current_amount} of ₹${g.target_amount}</div>
                        </div>
                    </div>
                    <span class="badge-tag">${Math.round((g.current_amount / g.target_amount) * 100)}%</span>
                </div>
            `).join('');
        }
    }

    if (impulseMon) {
        if (state.impulseItems.length === 0) {
            impulseMon.innerHTML = `<p class="text-muted">No active impulse pauses found.</p>`;
        } else {
            impulseMon.innerHTML = state.impulseItems.map(i => `
                <div class="monitor-row-item">
                    <div>
                        <strong>${escapeHtml(i.item_name)} — ₹${i.price}</strong>
                        <div class="text-muted" style="font-size:0.75rem;">Status: ${i.status.toUpperCase()} (${i.decision})</div>
                    </div>
                    <span class="category-tag">${i.is_need ? 'NEED' : 'WANT'}</span>
                </div>
            `).join('');
        }
    }
}

// 8. Render Admin Control Panel View
function renderAdminView() {
    if (!state.allUsers) return;

    const users = state.allUsers;
    const totalFunds = users.reduce((acc, u) => acc + (u.balance || 0), 0);

    const totalUsersEl = document.getElementById('adminTotalUsers');
    const totalFundsEl = document.getElementById('adminTotalFunds');
    const totalExpensesEl = document.getElementById('adminTotalExpenses');
    const totalQuizzesEl = document.getElementById('adminTotalQuizzes');

    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalFundsEl) totalFundsEl.textContent = `₹${totalFunds.toLocaleString('en-IN')}`;
    if (totalExpensesEl) totalExpensesEl.textContent = state.allExpenses ? state.allExpenses.length : 0;
    if (totalQuizzesEl) totalQuizzesEl.textContent = QuizEngine.getTotalCount().toLocaleString('en-IN');

    // Render Admin User Table
    const usersTable = document.getElementById('adminUsersTable');
    if (usersTable) {
        usersTable.innerHTML = users.map(u => {
            const roleBadgeClass = u.role === 'admin' ? 'role-badge-admin' : (u.role === 'parent' ? 'role-badge-parent' : 'role-badge-teen');
            const roleTitle = u.role ? u.role.toUpperCase() : 'TEEN';

            return `
                <tr>
                    <td>
                        <div class="flex-align-gap">
                            <span>${u.avatar || '🎯'}</span>
                            <strong>${escapeHtml(u.name)}</strong>
                        </div>
                    </td>
                    <td><span class="role-badge-pill ${roleBadgeClass}">${roleTitle}</span></td>
                    <td>₹${(u.pocket_money || 0).toLocaleString('en-IN')}</td>
                    <td>₹${(u.balance || 0).toLocaleString('en-IN')}</td>
                    <td>Level ${u.level || 1} • ${u.points || 0} XP</td>
                    <td class="text-right">
                        <button class="btn-secondary btn-sm" onclick="openAdminEditUserModal(${u.id})">Edit Role</button>
                        <button class="btn-delete-item margin-left-xs" onclick="deleteUserByAdmin(${u.id})" title="Delete User">&times;</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Render Admin Expenses Audit Table
    const auditTable = document.getElementById('adminExpensesAuditTable');
    if (auditTable && state.allExpenses) {
        if (state.allExpenses.length === 0) {
            auditTable.innerHTML = `<tr><td colspan="5" class="text-muted text-center" style="padding:1.5rem;">No system transactions recorded yet.</td></tr>`;
        } else {
            auditTable.innerHTML = state.allExpenses.map(e => `
                <tr>
                    <td><strong>${escapeHtml(e.user_name || 'User')}</strong></td>
                    <td>${escapeHtml(e.title)}</td>
                    <td><span class="category-tag">${getCategoryEmoji(e.category)} ${escapeHtml(e.category)}</span></td>
                    <td>${e.date}</td>
                    <td class="text-right"><strong>₹${e.amount.toLocaleString('en-IN')}</strong></td>
                </tr>
            `).join('');
        }
    }

    renderAdminQuizDirectoryTable();
}

function renderAdminQuizDirectoryTable() {
    const quizTable = document.getElementById('adminQuizTableBody');
    if (!quizTable) return;

    const searchTerm = (document.getElementById('adminQuizSearchInput')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('adminQuizCategoryFilter')?.value || 'ALL';

    const totalCount = QuizEngine.getTotalCount();
    let displayList = [];

    if (searchTerm) {
        for (let l = 1; l <= Math.min(totalCount, 500); l++) {
            const q = QuizEngine.getQuizByLevel(l);
            if (q.title.toLowerCase().includes(searchTerm) || q.scenario.toLowerCase().includes(searchTerm) || String(q.level) === searchTerm) {
                if (catFilter === 'ALL' || q.category === catFilter) {
                    displayList.push(q);
                }
            }
        }
    } else {
        // Show first 20 sample levels + any custom levels
        const sampleLevels = [1, 2, 3, 4, 5, 10, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000];
        const customQuizzes = QuizEngine.getCustomQuizzes();
        const customLevels = customQuizzes.map(q => q.level);

        const allTargetLevels = Array.from(new Set([...sampleLevels, ...customLevels])).sort((a, b) => a - b);

        allTargetLevels.forEach(l => {
            if (l <= totalCount) {
                const q = QuizEngine.getQuizByLevel(l);
                if (catFilter === 'ALL' || q.category === catFilter) {
                    displayList.push(q);
                }
            }
        });
    }

    if (displayList.length === 0) {
        quizTable.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="padding:1.5rem;">No quiz levels found matching search criteria.</td></tr>`;
        return;
    }

    quizTable.innerHTML = displayList.map(q => `
        <tr>
            <td><strong>Level ${q.level}</strong> ${q.is_boss ? '<span class="badge-tag text-amber"><i class="fa-solid fa-skull"></i> BOSS</span>' : ''}</td>
            <td><strong>${escapeHtml(q.title)}</strong></td>
            <td><span class="category-tag">${escapeHtml(q.category)}</span></td>
            <td style="max-width: 280px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(q.scenario)}</td>
            <td><span class="text-emerald">+${q.points_reward} XP</span></td>
            <td class="text-right">
                <button class="btn-secondary btn-sm" onclick="jumpToLevel(${q.level})">Play Level ⚡</button>
            </td>
        </tr>
    `).join('');
}

function renderWorldMap() {
    const grid = document.getElementById('worldTiersGrid');
    if (!grid) return;

    const tiers = [
        { id: 1, name: 'Novice Saver Realm', icon: '🌱', range: 'Levels 1 - 1,000', cat: 'smart_shopping', boss: 'Level 100 Boss Battle' },
        { id: 2, name: 'Budget Cyberpunk Zone', icon: '💡', range: 'Levels 1,001 - 2,500', cat: 'budgeting', boss: 'Level 2,500 Boss Battle' },
        { id: 3, name: 'Compound Interest Dojo', icon: '📈', range: 'Levels 2,501 - 4,000', cat: 'saving_basics', boss: 'Level 4,000 Boss Battle' },
        { id: 4, name: 'Stock Market Citadel', icon: '🚀', range: 'Levels 4,001 - 5,500', cat: 'investing', boss: 'Level 5,000 Boss Battle' },
        { id: 5, name: 'DeFi & Web3 Network', icon: '⚡', range: 'Levels 5,501 - 7,000', cat: 'crypto_web3', boss: 'Level 6,500 Boss Battle' },
        { id: 6, name: 'Real Estate Estate', icon: '🏢', range: 'Levels 7,001 - 8,500', cat: 'real_estate', boss: 'Level 8,000 Boss Battle' },
        { id: 7, name: 'Sovereign Wealth Throne', icon: '👑', range: 'Levels 8,501 - 10,000', cat: 'tax_wealth', boss: 'Level 10,000 Grand Finale' }
    ];

    const currentLvl = state.arcade.currentLevel;
    const activeTier = QuizEngine.getTier(currentLvl);

    grid.innerHTML = tiers.map(t => {
        const isActive = activeTier.id === t.id;
        const startLvl = (t.id - 1) * 1500 + 1;
        return `
            <div class="tier-card ${isActive ? 'active-realm' : ''}" onclick="jumpToLevel(${startLvl}); closeModal('modalWorldMap');">
                <div class="tier-card-header">
                    <span class="tier-title">${t.icon} ${t.name}</span>
                    <span class="tier-range">${t.range}</span>
                </div>
                <div class="text-muted" style="font-size:0.78rem;">Financial Domain: ${t.cat.toUpperCase()}</div>
                <div class="tier-boss-tag"><i class="fa-solid fa-crown text-amber"></i> ${t.boss}</div>
            </div>
        `;
    }).join('');
}

// Admin & Parent Actions
function openAdminEditUserModal(targetId) {
    const u = state.allUsers.find(user => user.id === targetId);
    if (!u) return;
    document.getElementById('adminEditUserId').value = u.id;
    document.getElementById('adminEditUserName').textContent = u.name;
    document.getElementById('adminEditRole').value = u.role || 'teen';
    document.getElementById('adminEditAllowance').value = u.pocket_money || 4000;
    openModal('modalAdminEditUser');
}

async function deleteUserByAdmin(userId) {
    if (confirm('Permanently delete this user account and all their records?')) {
        const res = await API.post('/admin/user/delete', { target_user_id: userId });
        if (res && res.success) {
            showToast(res.message, 'info');
            await loadAllData();
        }
    }
}

function openParentTopupForUser(userId) {
    const select = document.getElementById('parentTopupUserSelect');
    if (select) select.value = userId;
    openModal('modalParentTopup');
}

// Live Cool-off Countdown Timers Update Loop
function updateCooloffTimers() {
    const timerEls = document.querySelectorAll('.countdown-timer');
    const now = new Date().getTime();

    timerEls.forEach(el => {
        const untilStr = el.getAttribute('data-until');
        if (!untilStr) return;

        const targetDate = new Date(untilStr.replace(' ', 'T')).getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            el.textContent = "⏱️ Cool-off Ready! Make Decision";
            el.style.color = "var(--accent-emerald)";
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            el.textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
        }
    });
}

// Mobile Slide-over Drawer Navigation Handler
function initMobileDrawer() {
    const btnOpen = document.getElementById('btnMobileMenu');
    const btnClose = document.getElementById('btnCloseDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');

    btnOpen?.addEventListener('click', () => overlay?.classList.add('active'));
    btnClose?.addEventListener('click', () => overlay?.classList.remove('active'));
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    document.querySelectorAll('.mobile-drawer [data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay?.classList.remove('active');
        });
    });
}

function switchTab(targetTab) {
    if (!targetTab) return;
    state.activeTab = targetTab;

    document.querySelectorAll('[data-tab]').forEach(b => {
        if (b.getAttribute('data-tab') === targetTab) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-view').forEach(v => {
        if (v.id === `view-${targetTab}`) {
            v.classList.add('active');
        } else {
            v.classList.remove('active');
        }
    });

    updatePageHeaderTitle(targetTab);
}

// Navigation & Tab Switching Handler
function initNavigation() {
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    document.getElementById('btnGoToExpenses')?.addEventListener('click', () => {
        switchTab('expenses');
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.expenseCategoryFilter = chip.getAttribute('data-category');
            renderExpensesView();
        });
    });
}

function updatePageHeaderTitle(tab) {
    const titleMap = {
        'overview': { title: 'Dashboard Overview', sub: 'Track pocket money, build savings habits & control impulse buys' },
        'expenses': { title: 'Expenses Tracker', sub: 'Log and analyze where your pocket money is spent' },
        'goals': { title: 'Target Savings Goals', sub: 'Save money for items you really want long-term' },
        'impulse': { title: 'Should I Buy This?', sub: 'Use the 48-hour cool-off pause timer to eliminate impulse spending' },
        'learn': { title: 'Quizzes & Quests', sub: 'Complete weekly quests and master financial scenario quizzes' },
        'profile': { title: 'Profile & Achievements', sub: 'View unlocked badges, XP level rank, and pocket money settings' },
        'parent': { title: 'Parent & Guardian Hub', sub: 'Monitor teen allowance usage, grant chore bonuses, and encourage savings' },
        'admin': { title: 'Admin Control Panel', sub: 'Manage user roles, system allowances, quiz scenarios, and expense audit logs' }
    };
    const info = titleMap[tab] || titleMap['overview'];
    const pTitle = document.getElementById('pageTitle');
    if (pTitle) pTitle.textContent = info.title;
    const pSub = document.getElementById('pageSubtitle');
    if (pSub) pSub.textContent = info.sub;
}

// Modal Toggle Dialog Logic
function initModals() {
    document.getElementById('btnQuickExpense')?.addEventListener('click', () => openModal('modalExpense'));
    document.getElementById('btnOpenExpenseModal')?.addEventListener('click', () => openModal('modalExpense'));
    document.getElementById('btnOpenGoalModal')?.addEventListener('click', () => openModal('modalGoal'));
    document.getElementById('btnOpenImpulseModal')?.addEventListener('click', () => openModal('modalImpulse'));
    document.getElementById('btnAdminAddQuizModal')?.addEventListener('click', () => openModal('modalAdminQuiz'));
    document.getElementById('btnParentTopupModal')?.addEventListener('click', () => {
        populateParentTopupSelect();
        openModal('modalParentTopup');
    });

    document.getElementById('btnEditProfile')?.addEventListener('click', () => {
        if (state.user) {
            document.getElementById('editProfileName').value = state.user.name;
            document.getElementById('editPocketMoney').value = state.user.pocket_money;
        }
        openModal('modalProfile');
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    document.getElementById('btnResetDB')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all demo data back to SpendWise defaults?')) {
            const res = await API.post('/reset', {});
            if (res && res.success) {
                showToast(res.message, 'success');
                await loadAllData();
            }
        }
    });

    document.getElementById('btnLifeline5050')?.addEventListener('click', triggerLifeline5050);
    document.getElementById('btnLifelineHint')?.addEventListener('click', triggerLifelineHint);
    document.getElementById('btnLifelineSkip')?.addEventListener('click', skipCurrentLevel);

    // Cyber HUD Level Jump Handlers
    document.getElementById('btnCyberJump')?.addEventListener('click', () => {
        const val = document.getElementById('cyberJumpInput')?.value;
        if (val) jumpToLevel(val);
    });
    document.getElementById('cyberJumpInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = document.getElementById('cyberJumpInput')?.value;
            if (val) jumpToLevel(val);
        }
    });

    // Map Jump Handler
    document.getElementById('btnMapJump')?.addEventListener('click', () => {
        const val = document.getElementById('mapJumpInput')?.value;
        if (val) {
            jumpToLevel(val);
            closeModal('modalWorldMap');
        }
    });

    // World Stage Map Trigger
    document.getElementById('btnOpenWorldMap')?.addEventListener('click', () => {
        renderWorldMap();
        openModal('modalWorldMap');
    });

    // SFX & Quiz Mute Toggle Handlers
    const toggleSFX = () => updateSFXUI(!CyberAudioSynth.sfxEnabled, true);
    document.getElementById('btnToggleSFX')?.addEventListener('click', toggleSFX);
    document.getElementById('btnQuizMuteToggle')?.addEventListener('click', toggleSFX);


    // Admin Add Quiz Buttons
    document.getElementById('btnAdminAddQuizModal2')?.addEventListener('click', () => {
        const lvlInput = document.getElementById('adminQuizLevel');
        if (lvlInput) lvlInput.value = QuizEngine.getTotalCount() + 1;
        openModal('modalAdminQuiz');
    });

    // Admin Batch Add Generator (+100 Levels)
    document.getElementById('btnAdminBatchAdd')?.addEventListener('click', async () => {
        if (confirm('Generate +100 new procedural financial scenario levels to expand the question universe?')) {
            const customQuizzes = QuizEngine.getCustomQuizzes();
            const startLevel = QuizEngine.getTotalCount() + 1;
            const categories = ['smart_shopping', 'budgeting', 'saving_basics', 'mindset', 'investing', 'crypto_web3', 'real_estate', 'tax_wealth'];

            for (let i = 0; i < 100; i++) {
                const targetLvl = startLevel + i;
                const cat = categories[i % categories.length];
                const newQ = {
                    id: targetLvl,
                    level: targetLvl,
                    title: `Level ${targetLvl}: Custom Admin Batch Quest #${targetLvl}`,
                    category: cat,
                    scenario: `Admin Scenario Level ${targetLvl}: A tech item costs ₹${(i + 1) * 250}. Your budget allowance is ₹4,000. What is the optimal strategic savings action?`,
                    option_a: 'Spend all pocket money immediately without saving.',
                    option_b: 'Put it on a 48-hour cool-off period and deposit 20% into savings.',
                    option_c: 'Borrow high-interest debt.',
                    option_d: 'Ignore personal budget limits.',
                    correct_option: 2,
                    explanation: 'The 48-hour cool-off rule and 20% savings rule build resilient financial habits!',
                    points_reward: 80,
                    is_boss: (targetLvl % 50 === 0)
                };
                customQuizzes.push(newQ);
            }
            localStorage.setItem('spendwise_db_custom_quizzes', JSON.stringify(customQuizzes));
            showToast(`🚀 Successfully generated +100 new levels! Total Question Universe: ${QuizEngine.getTotalCount().toLocaleString('en-IN')}`, 'success');
            await loadAllData();
        }
    });

    // Admin Search & Filter Table Listeners
    document.getElementById('adminQuizSearchInput')?.addEventListener('input', renderAdminQuizDirectoryTable);
    document.getElementById('adminQuizCategoryFilter')?.addEventListener('change', renderAdminQuizDirectoryTable);

    document.getElementById('btnCollectVictoryXP')?.addEventListener('click', async () => {
        closeModal('modalTriviaVictory');
        state.arcade.currentLevel = 1;
        state.arcade.streak = 0;
        state.arcade.score = 0;
        state.arcade.totalXPRound = 0;
        state.arcade.lifeline5050Used = false;
        state.arcade.lifelineHintUsed = false;
        await loadAllData();
    });
}

function populateParentTopupSelect() {
    const select = document.getElementById('parentTopupUserSelect');
    if (!select || !state.allUsers) return;

    const teens = state.allUsers.filter(u => u.role === 'teen' || !u.role);
    select.innerHTML = teens.map(t => `<option value="${t.id}">${escapeHtml(t.name)} (Balance: ₹${t.balance})</option>`).join('');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openDepositModal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    document.getElementById('depositGoalId').value = goal.id;
    document.getElementById('depositModalTitle').textContent = `Deposit Money to "${goal.title}"`;
    document.getElementById('depositAvailableBal').textContent = `₹${(state.stats ? state.stats.balance : 0).toLocaleString('en-IN')}`;
    const remaining = Math.max(10, goal.target_amount - goal.current_amount);
    document.getElementById('depositAmount').value = Math.min(200, remaining);
    openModal('modalDeposit');
}

function openResolveModal(itemId) {
    const item = state.impulseItems.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('resolveItemId').value = itemId;
    document.getElementById('resolveSummaryText').innerHTML = `
        <p style="font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem;">
            ${escapeHtml(item.item_name)} — ₹${item.price}
        </p>
        <p class="text-muted">
            Pause timer completed! You took 48 hours to cool off. Do you still want to buy this item?
        </p>
    `;

    openModal('modalResolveImpulse');
}

// Forms Submission Setup
function initForms() {
    // Add Expense
    document.getElementById('formAddExpense')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('expTitle').value,
            amount: parseFloat(document.getElementById('expAmount').value),
            category: document.getElementById('expCategory').value,
            date: document.getElementById('expDate').value || new Date().toISOString().split('T')[0],
            description: document.getElementById('expNotes').value
        };

        const res = await API.post('/expenses', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalExpense');
            document.getElementById('formAddExpense').reset();
            await loadAllData();
        }
    });

    // Add Goal
    document.getElementById('formAddGoal')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('goalTitle').value,
            target_amount: parseFloat(document.getElementById('goalTarget').value),
            icon: document.getElementById('goalIcon').value,
            deadline: document.getElementById('goalDeadline').value
        };

        const res = await API.post('/goals', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalGoal');
            document.getElementById('formAddGoal').reset();
            await loadAllData();
        }
    });

    // Deposit to Goal
    document.getElementById('formDepositGoal')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            goal_id: parseInt(document.getElementById('depositGoalId').value),
            amount: parseFloat(document.getElementById('depositAmount').value)
        };

        const res = await API.post('/goals/deposit', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalDeposit');
            await loadAllData();
        }
    });

    // Add Impulse Test
    document.getElementById('formAddImpulse')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isNeedRadio = document.querySelector('input[name="impNeed"]:checked');
        const payload = {
            item_name: document.getElementById('impItemName').value,
            price: parseFloat(document.getElementById('impPrice').value),
            category: document.getElementById('impCategory').value,
            is_need: isNeedRadio ? parseInt(isNeedRadio.value) : 0,
            usage_freq: document.getElementById('impFreq').value,
            decision: 'cooldown'
        };

        const res = await API.post('/should-i-buy', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalImpulse');
            document.getElementById('formAddImpulse').reset();
            await loadAllData();
        }
    });

    // Resolve Impulse Buttons
    document.getElementById('btnActionSaveMoney')?.addEventListener('click', async () => {
        const itemId = parseInt(document.getElementById('resolveItemId').value);
        const notes = document.getElementById('resolveNotes').value;

        const res = await API.post('/should-i-buy/resolve', {
            item_id: itemId,
            final_action: 'saved',
            notes: notes
        });

        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalResolveImpulse');
            await loadAllData();
        }
    });

    document.getElementById('btnActionBuyPlanned')?.addEventListener('click', async () => {
        const itemId = parseInt(document.getElementById('resolveItemId').value);
        const notes = document.getElementById('resolveNotes').value;

        const res = await API.post('/should-i-buy/resolve', {
            item_id: itemId,
            final_action: 'bought',
            notes: notes
        });

        if (res && res.success) {
            showToast(res.message, 'info');
            closeModal('modalResolveImpulse');
            await loadAllData();
        }
    });

    // Edit Profile Form
    document.getElementById('formEditProfile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('editProfileName').value,
            pocket_money: parseFloat(document.getElementById('editPocketMoney').value)
        };

        const res = await API.post('/user/update', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalProfile');
            await loadAllData();
        }
    });

    // Admin Add Quiz Form
    document.getElementById('formAdminAddQuiz')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetLevelVal = parseInt(document.getElementById('adminQuizLevel')?.value || (QuizEngine.getTotalCount() + 1));
        const payload = {
            title: document.getElementById('adminQuizTitle').value,
            level: targetLevelVal,
            category: document.getElementById('adminQuizCategory').value,
            scenario: document.getElementById('adminQuizScenario').value,
            option_a: document.getElementById('adminQuizOptA').value,
            option_b: document.getElementById('adminQuizOptB').value,
            option_c: document.getElementById('adminQuizOptC').value,
            option_d: document.getElementById('adminQuizOptD').value,
            correct_option: parseInt(document.getElementById('adminQuizCorrect').value),
            explanation: document.getElementById('adminQuizExplanation').value,
            points_reward: parseInt(document.getElementById('adminQuizPoints').value),
            is_boss: (targetLevelVal % 50 === 0)
        };

        // Save custom quiz in LocalStorage
        const customQuizzes = QuizEngine.getCustomQuizzes();
        customQuizzes.push(payload);
        localStorage.setItem('spendwise_db_custom_quizzes', JSON.stringify(customQuizzes));

        // Send to backend API
        const res = await API.post('/admin/quiz', payload);
        showToast(res && res.message ? res.message : `Custom Question Added! Question Universe: ${QuizEngine.getTotalCount().toLocaleString('en-IN')}`, 'success');
        closeModal('modalAdminQuiz');
        document.getElementById('formAdminAddQuiz').reset();
        await loadAllData();
    });

    // Parent Top-up Form
    document.getElementById('formParentTopup')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            target_user_id: parseInt(document.getElementById('parentTopupUserSelect').value),
            amount: parseFloat(document.getElementById('parentTopupAmount').value),
            bonus_xp: parseInt(document.getElementById('parentTopupXP').value || 50),
            note: document.getElementById('parentTopupNote').value
        };

        const res = await API.post('/parent/top-up', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalParentTopup');
            document.getElementById('formParentTopup').reset();
            await loadAllData();
        }
    });

    // Admin Edit User Role Form
    document.getElementById('formAdminEditUser')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            target_user_id: parseInt(document.getElementById('adminEditUserId').value),
            role: document.getElementById('adminEditRole').value,
            pocket_money: parseFloat(document.getElementById('adminEditAllowance').value)
        };

        const res = await API.post('/admin/user/update-role', payload);
        if (res && res.success) {
            showToast(res.message, 'success');
            closeModal('modalAdminEditUser');
            await loadAllData();
        }
    });

    const expDateInput = document.getElementById('expDate');
    if (expDateInput) expDateInput.value = new Date().toISOString().split('T')[0];
}

// Claim Challenge Reward
async function claimChallenge(chId) {
    const res = await API.post('/challenges/claim', { challenge_id: chId });
    if (res && res.success) {
        showToast(res.message, 'success');
        await loadAllData();
    }
}

// Helper: Category Emoji Picker
function getCategoryEmoji(cat) {
    const map = {
        'Food': '🍔',
        'Outings': '☕',
        'Tech': '💻',
        'Entertainment': '🎟️',
        'Shopping': '🛍️',
        'Hobbies': '📚'
    };
    return map[cat] || '📦';
}

// Helper: Toggle password field visibility (eye icon button)
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    }
}

// Helper: Pre-fill username on Sign In form when a profile card is clicked
function prefillLoginUsername(username) {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    if (usernameInput) {
        usernameInput.value = username;
        showToast(`Username pre-filled as "${username}". Enter your password to sign in.`, 'info');
    }
    if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
    }
}

// Helper: Escape HTML string
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald' : 'fa-circle-exclamation text-rose'}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// EXPOSE ALL DYNAMIC ACTION HANDLERS GLOBALLY ON WINDOW
window.loginAsUser = loginAsUser;
window.loginAsAdmin = loginAsAdmin;
window.promptAdminLogin = promptAdminLogin;
window.deleteExpense = deleteExpense;
window.deleteGoal = deleteGoal;
window.deleteImpulseItem = deleteImpulseItem;
window.claimChallenge = claimChallenge;
window.openDepositModal = openDepositModal;
window.openResolveModal = openResolveModal;
window.handleArcadeAnswer = handleArcadeAnswer;
window.openAdminEditUserModal = openAdminEditUserModal;
window.deleteUserByAdmin = deleteUserByAdmin;
window.openParentTopupForUser = openParentTopupForUser;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.jumpToLevel = jumpToLevel;
window.updateSFXUI = updateSFXUI;
window.toggleQuizMute = () => updateSFXUI(!CyberAudioSynth.sfxEnabled, true);


