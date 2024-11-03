require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Database setup
const db = new sqlite3.Database('./mydb.sqlite', (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT UNIQUE NOT NULL, 
            password TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS user_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            user_id INTEGER NOT NULL, 
            account_name TEXT NOT NULL, 
            encryptedPrivateKey TEXT NOT NULL, 
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
    }
});

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your React app's URL
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Encryption function
function encryptPrivateKey(privateKey, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedData: `${salt.toString('hex')}::${iv.toString('hex')}::${encrypted}` };
}

// Decryption function
function decryptPrivateKey(encryptedData, password) {
    const [saltHex, ivHex, encrypted] = encryptedData.split('::');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Sign up route
app.post('/signup', async (req, res) => {
    console.log('Received signup request:', req.body);
    const { username, password, accounts } = req.body;

    if (!username || !password || !accounts || !accounts.length) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: "Username already exists" });
                }
                console.error("Database error during signup:", err.message);
                return res.status(500).json({ error: "Database error during signup" });
            }

            const userId = this.lastID;
            const stmt = db.prepare('INSERT INTO user_accounts (user_id, account_name, encryptedPrivateKey) VALUES (?, ?, ?)');
            accounts.forEach(account => {
                if (!account.account_name || !account.privateKey) {
                    console.error("Missing account details:", account);
                    return res.status(400).json({ error: "Invalid account data. Account name and private key are required." });
                }

                const { encryptedData } = encryptPrivateKey(account.privateKey, password);
                stmt.run(userId, account.account_name, encryptedData);
            });
            stmt.finalize();

            console.log(`User signed up successfully with ID: ${userId}`);
            res.status(201).json({ id: userId });
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
});

// Login route
// Login route
app.post('/login', (req, res) => {
    console.log('Received login request:', req.body);
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error("Database error during login:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        db.all('SELECT * FROM user_accounts WHERE user_id = ?', [user.id], (err, accounts) => {
            if (err) {
                console.error("Error retrieving user accounts:", err.message);
                return res.status(500).json({ error: "Database error" });
            }

            try {
                // Include the account name and decrypted private key in the response
                const decryptedAccounts = accounts.map(account => ({
                    account_name: account.account_name,
                    privateKey: decryptPrivateKey(account.encryptedPrivateKey, password) // Decrypt the private key
                }));

                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                console.log(`User ${username} logged in successfully`);
                res.json({ token, accounts: decryptedAccounts }); // Send account name and private key

            } catch (decryptionError) {
                console.error("Decryption error:", decryptionError);
                res.status(500).json({ error: "Decryption error" });
            }
        });
    });
});

// Protected route (requires a valid JWT)
app.get('/protected', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden - Invalid token' });
        }
        req.user = user;
        res.json({ message: `Hello, User ${user.id}! This is protected content.` });
    });
});
