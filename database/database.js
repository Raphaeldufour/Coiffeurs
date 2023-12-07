import fs from 'fs';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

// Charger le fichier JSON
const rawData = fs.readFileSync('coiffeurs.json');
const jsonData = JSON.parse(rawData);

// Créer une nouvelle base de données SQLite
const db = new sqlite3.Database('database.db');

const saltRounds = 10;
const email = "username@student.school.us";
const myPlaintextPassword = 'cisco123';


async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return {salt, hash};
}

// Créer une table pour stocker les enseignes de coiffure
db.serialize(async () => {
    db.run(` 
 CREATE TABLE IF NOT EXISTS enseignes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(30),
    lat Decimal(8,6),
    lng Decimal(9,6),
    num INTEGER,
    voie VARCHAR(100),
    ville VARCHAR(50),
    codepostal INTEGER
  );`);
    db.run(`
CREATE TABLE IF NOT EXISTS Utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);`);

    // Insérer les données du fichier JSON dans la table
    const insertStmt = db.prepare(`INSERT INTO enseignes (
    nom, lat, lng, num, voie, ville, codepostal
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    jsonData.data.features.forEach(feature => {
        const properties = feature.properties;
        insertStmt.run(
            properties.nom,
            properties.lat,
            properties.lng,
            properties.num,
            properties.voie,
            properties.ville,
            properties.codepostal
        );
    });

    const insertUserStmt = db.prepare(`INSERT INTO Utilisateurs (
    email, password
    ) VALUES (?, ?)`);

    insertUserStmt.run(
        email,
        (await hashPassword(myPlaintextPassword)).hash
    );
    insertStmt.finalize();
    insertUserStmt.finalize();
});

db.close();
