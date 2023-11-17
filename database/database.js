import fs from 'fs';
import sqlite3 from 'sqlite3';

// Charger le fichier JSON
const rawData = fs.readFileSync('coiffeurs.json');
const jsonData = JSON.parse(rawData);

// Créer une nouvelle base de données SQLite
const db = new sqlite3.Database('database.db');

// Créer une table pour stocker les enseignes de coiffure
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS enseignes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(30),
    lat Decimal(8,6),
    lng Decimal(9,6),
    num INTEGER,
    voie VARCHAR(100),
    ville VARCHAR(50),
    codepostal INTEGER,
    markerinnerhtml TEXT,
    liinnerhtml TEXT,
    addresse VARCHAR(200)
  )`);

    // Insérer les données du fichier JSON dans la table
    const insertStmt = db.prepare(`INSERT INTO enseignes (
    nom, lat, lng, num, voie, ville, codepostal, markerinnerhtml, liinnerhtml, addresse
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    jsonData.data.features.forEach(feature => {
        const properties = feature.properties;
        insertStmt.run(
            properties.nom,
            properties.lat,
            properties.lng,
            properties.num,
            properties.voie,
            properties.ville,
            properties.codepostal,
            properties.markerinnerhtml,
            properties.liinnerhtml,
            properties.addresse
        );
    });

    insertStmt.finalize();
});

// Fermer la base de données après l'insertion des données
db.close();
