import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';



const app = express();
app.use(express.static('public'));

const db = new sqlite3.Database('database/database.db');

app.get('/api/enseignes', (req, res) => {
    db.all('SELECT * FROM enseignes ORDER BY nom', (err, enseignes) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(enseignes);
        }
    });
});


app.get('/api/logintoenter', (req, res) => {
    fs.readFile('database/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const loginData = JSON.parse(data);
        res.json(loginData);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})