const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');

function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json());
}

function renderEnseigne(enseigne, index) {
    const clone = templateEnseigne.content.cloneNode(true);
    clone.querySelector('.enseigne-coiffeur-nom').textContent = enseigne.nom;
    const numero = enseigne.num ?? '';  //vérifie si num existe, sinon met une chaine vide
    clone.querySelector('.enseigne-coiffeur-rue').textContent =  numero + ' ' + enseigne.voie;
    clone.querySelector('.enseigne-coiffeur-ville').textContent = enseigne.codepostal + ' ' + enseigne.ville;
    clone.querySelector('.enseigne-coiffeur-index').textContent = index;
    containerEnseigne.appendChild(clone);
}

getEnseignes()
    .then(enseignes => {
        enseignes.forEach(enseigne => {
            renderEnseigne(enseigne, enseignes.indexOf(enseigne) + 1);
        });
        nombreCoiffeurs.textContent = enseignes.length;
    });
