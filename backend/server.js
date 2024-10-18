const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Function to encrypt private keys
const encryptPrivateKey = (privateKey) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedKey: encrypted, key: key.toString('hex'), iv: iv.toString('hex') };
};

// Function to decrypt private keys
const decryptPrivateKey = (encryptedData, key, iv) => {
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Sign up route
app.post('/signup', async (req, res) => {
    const { username, password, accounts } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const userId = this.lastID;
        const stmt = db.prepare(`INSERT INTO user_accounts (user_id, account_name, encryptedPrivateKey) VALUES (?, ?, ?)`);
        accounts.forEach(account => {
            const { encryptedKey, key, iv } = encryptPrivateKey(account.privateKey);
            stmt.run(userId, account.account_name, encryptedKey + '::' + key + '::' + iv); // Store the key and iv with the encrypted key
        });
        stmt.finalize();
        res.status(201).json({ id: userId });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (bcrypt.compareSync(password, user.password)) {
            db.all(`SELECT * FROM user_accounts WHERE user_id = ?`, [user.id], (err, accounts) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token, accounts });
            });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
