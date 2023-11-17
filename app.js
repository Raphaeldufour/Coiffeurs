import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.static('public'));

const db = new sqlite3.Database('database/database.db');

app.get('/api/enseignes', (req, res) => {
    db.all('SELECT * FROM enseignes', (err, enseignes) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(enseignes);
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});