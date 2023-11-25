import express from 'express';
import sqlite3 from 'sqlite3';
import {promises as fsp} from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

let email = '';
let password = '';

const db = new sqlite3.Database('database/database.db');

async function getLoginAndPassword() {
    const fileContent = await fsp.readFile('user.json', 'utf-8');
    const data = JSON.parse(fileContent);
    email = data.utilisateur.email;
    password = data.utilisateur.password;
}
getLoginAndPassword();

app.get('/api/enseignes', (req, res) => {
    db.all('SELECT * FROM enseignes ORDER BY nom', (err, enseignes) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération des enseignes');
        } else {
            res.json(enseignes);
        }
    });
});

app.patch('/api/enseignes', (req, res) => {
    const data = req.body;
    const id = data.id;
    const name = data.name;
    const lat = data.lat;
    const lng = data.lng;
    const num = data.num;
    const voie = data.voie;
    const ville = data.ville;
    const codepostal = data.codepostal;

    db.run('UPDATE enseignes SET nom = ?, lat = ?, lng = ?, num = ?, voie = ?, ville = ?, codepostal = ? WHERE id = ?', [name, lat, lng, num, voie, ville, codepostal, id], (err) => {
        if (err)
        {
            res.status(500).send('Erreur lors de la modification de l\'enseigne');
        } else {
            res.json({message: 'Enseigne modifiée avec succès'});
        }
    } );

});


app.post('/user', (req, res) => {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    if (emailBody === email && passwordBody === password) {
        res.json({message: 'Vous êtes connecté'});
    } else {
        res.status(401).json({message: 'Identifiants incorrects'});
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})