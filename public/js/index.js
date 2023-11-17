const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');
let indexPage = 10;
let enseignes = [];
let isLoading = false;

function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json());
}

function renderEnseigne(enseigne, index) {
    const clone = templateEnseigne.content.cloneNode(true);
    clone.querySelector('.enseigne-coiffeur-nom').textContent = enseigne.nom;
    const numero = enseigne.num ?? '';  //vérifie si num existe, sinon met une chaine vide
    clone.querySelector('.enseigne-coiffeur-rue').textContent = numero + ' ' + enseigne.voie;
    clone.querySelector('.enseigne-coiffeur-ville').textContent = enseigne.codepostal + ' ' + enseigne.ville;
    clone.querySelector('.enseigne-coiffeur-index').textContent = index;
    containerEnseigne.appendChild(clone);
}

function renderEnseignes(enseignes, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        if (i < enseignes.length) {
            renderEnseigne(enseignes[i], i + 1);
        }
    }
}

function loadMoreEnseignes(enseignes) {
    if (!isLoading) {
        isLoading = true;
        renderEnseignes(enseignes, indexPage - 10, indexPage);
        indexPage += 10;
        isLoading = false;
    }
}

function checkScroll() {
    if ((window.scrollY + window.innerHeight) >= document.body.offsetHeight) {
        loadMoreEnseignes(enseignes);
    }
}

function init() {
    getEnseignes()
        .then(initialEnsignes => {
            enseignes = initialEnsignes;
            renderEnseignes(enseignes, 0, indexPage);
            indexPage += 10;
            nombreCoiffeurs.textContent = enseignes.length.toString();
        });
    window.addEventListener('scroll', checkScroll);
}

init();
