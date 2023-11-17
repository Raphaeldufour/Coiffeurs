const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');

function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json());
}

function renderEnseigne(enseigne) {
    const clone = templateEnseigne.content.cloneNode(true);
    clone.querySelector('.enseigne-coiffeur-nom').textContent = enseigne.nom;
    clone.querySelector('.enseigne-coiffeur-rue').textContent = enseigne.num + ' ' + enseigne.voie;
    clone.querySelector('.enseigne-coiffeur-ville').textContent = enseigne.codepostal + ' ' + enseigne.ville;
    containerEnseigne.appendChild(clone);
}

getEnseignes()
    .then(enseignes => {
        enseignes.forEach(enseigne => renderEnseigne(enseigne));
    });