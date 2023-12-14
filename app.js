import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const db = new sqlite3.Database('database/database.db');

function dontContainsLetters(str) {
    return !/[a-zA-Z]/.test(str);
}

function containsDigits(string) {
    return /\d/.test(string);
}

function okayForEdit(ancientInfos, newInfos) {
    let isOkay = true;
    if (
        isNaN(newInfos[1]) || newInfos[1].includes(' ') || newInfos[1] === '' ||
        isNaN(newInfos[3]) || newInfos[3].includes(' ') || newInfos[3] === '' ||
        isNaN(newInfos[5]) || newInfos[5].includes(' ') || newInfos[5] === '' || Math.abs(parseFloat(newInfos[5])) > 90 ||
        isNaN(newInfos[6]) || newInfos[6].includes(' ') || newInfos[6] === '' || Math.abs(parseFloat(newInfos[6])) > 180
    ) {
        isOkay = false;
    } else if (
        dontContainsLetters(newInfos[0]) ||
        dontContainsLetters(newInfos[2]) ||
        dontContainsLetters(newInfos[4]) || containsDigits(newInfos[4])
    ) {
        isOkay = false;
    } else if (ancientInfos !== null) {
        for (let i = 0; i < newInfos.length; i++) {
            if (newInfos[i].toString() !== ancientInfos[i].toString()) {
                isOkay = true
                break;
            } else {
                isOkay = false;
            }
        }
    }
    return isOkay;
}


app.get('/api/enseignes', (req, res) => {
    if(req.query.index)
    {
        console.log(req.query.index);
        db.all('SELECT * FROM enseignes ORDER BY nom LIMIT 10 OFFSET ?', req.query.index, (err, enseignes) => {
            if (err) {
                res.status(500).send('Erreur lors de la récupération des enseignes');
            } else {
                res.json(enseignes);
            }
        });
    }
});

app.patch('/api/enseignes', verifyToken, (req, res) => {
    const data = req.body;
    const id = data.id;
    const ancientInfos = [data.ancientInfos.nom, data.ancientInfos.num, data.ancientInfos.voie, data.ancientInfos.codepostal, data.ancientInfos.ville, data.ancientInfos.lat, data.ancientInfos.lng];
    const newInfos = [data.newInfos.nom, data.newInfos.num, data.newInfos.voie, data.newInfos.codepostal, data.newInfos.ville, data.newInfos.lat, data.newInfos.lng];

    if (okayForEdit(ancientInfos, newInfos)) {

        const name = newInfos[0];
        const num = newInfos[1];
        const voie = newInfos[2];
        const codepostal = newInfos[3];
        const ville = newInfos[4];
        const lat = newInfos[5];
        const lng = newInfos[6];

        db.run('UPDATE enseignes SET nom = ?, lat = ?, lng = ?, num = ?, voie = ?, ville = ?, codepostal = ? WHERE id = ?', [name, lat, lng, num, voie, ville, codepostal, id], (err) => {
            if (err) {
                res.status(500).json({message: 'Erreur lors de la modification de l\'enseigne'});
            } else {

                res.json({message: 'Enseigne modifiée avec succès'});
            }
        });
    } else {
        res.status(500).json({message: 'Erreur : certains champs n\'ont pas été remplis ou sont incorrects'});
    }
});


app.put('/api/enseignes', (req, res) => {
    const data = req.body;

    const newInfos = [data.newInfos.nom, data.newInfos.num, data.newInfos.voie, data.newInfos.codepostal, data.newInfos.ville, data.newInfos.lat, data.newInfos.lng];

    if (okayForEdit(null, newInfos)) {
        const name = newInfos[0];
        const num = newInfos[1];
        const voie = newInfos[2];
        const codepostal = newInfos[3];
        const ville = newInfos[4];
        const lat = newInfos[5];
        const lng = newInfos[6];

        db.run('INSERT INTO enseignes (nom, lat, lng, num, voie, ville, codepostal) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, lat, lng, num, voie, ville, codepostal], (err) => {
            if (err) {
                res.status(500).json({message: 'Erreur lors de la création de l\'enseigne'});
            } else {
                res.json({message: 'Enseigne créée avec succès'});
            }
        });
    } else {
        res.status(500).json({message: 'Erreur : certains champs n\'ont pas été remplis ou sont incorrects'});
    }
});


function deleteExpiredToken() {
    db.run('DELETE FROM Tokens WHERE expirationDate < ?', Date.now(), (err) => {
        if (err) {
            console.log('Erreur lors de la suppression des tokens expirés');
        }
    });
}

app.post('/user', async (req, res) => {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    db.get('SELECT * FROM Utilisateurs WHERE email = ?', [emailBody], async (err, user) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
        } else if (user) {
            const passwordCorrect = await bcrypt.compare(passwordBody, user.password);
            if (passwordCorrect) {
                const token = randomstring.generate();
                const expirationDate = Date.now() + 3600000;
                db.run('INSERT INTO Tokens (token, user_id, expirationDate) VALUES (?, ?, ?)', [token, user.id, expirationDate], (err) => {
                    if (err) {
                        res.status(500).send('Erreur lors de la création du token');
                    } else {
                        res.json({token: token});
                    }
                });
                deleteExpiredToken();
            } else {
                res.status(401).json({message: 'Mot de passe incorrect'});
            }
        } else {
            res.status(401).json({message: 'Email incorrect'});
        }
    });
});

function verifyToken(req, res, next) {
    // Récupérer le token de l'en-tête de la requête
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({message: 'No token provided.'});
    }
    db.get('SELECT * FROM Tokens WHERE token = ?', token, (err, token) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération du token');
        } else if (token) {
            if (Date.now() > token.expirationDate) {
                res.status(401).send('Token expiré');
            } else {
                next();
            }
        } else {
            res.status(401).send('Token invalide');
        }
    });
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})