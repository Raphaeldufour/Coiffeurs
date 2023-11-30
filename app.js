import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const db = new sqlite3.Database('database/database.db');

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
        if (err) {
            res.status(500).send('Erreur lors de la modification de l\'enseigne');
        } else {
            res.json({message: 'Enseigne modifiée avec succès'});
        }
    });

});

app.post('/user', async (req, res) => {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    db.get('SELECT * FROM Utilisateurs WHERE email = ?', [emailBody], async (err, user) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
        } else if (user) {
            const passwordCorrect = await bcrypt.compare(passwordBody, user.mot_de_passe_hache);
            if (passwordCorrect) {
                res.json({message: 'Connexion réussie'});
            } else {
                res.status(401).json({message: 'Mot de passe incorrect'});
            }
        } else {
            res.status(401).json({message: 'Email incorrect'});
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})