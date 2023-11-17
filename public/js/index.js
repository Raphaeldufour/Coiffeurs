const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');

const logImgContainer = document.getElementById('logImgContainer');



let indexPage = 10;
let enseignes = [];
let affichageEnseignes = [];


function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json())
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
        renderEnseignes(enseignes, indexPage - 10, indexPage);
        indexPage += 10;
}

function checkScroll() {
    if ((window.scrollY + window.innerHeight) >= document.body.offsetHeight) {
        loadMoreEnseignes(affichageEnseignes);
    }
}

function filterEnseignes() {
    const searchValue = inputRecherche.value;
    affichageEnseignes = enseignes.filter(enseigne => {
        const nomLowerCase = enseigne.nom ? enseigne.nom.toLowerCase() : '';
        const villeLowerCase = enseigne.ville ? enseigne.ville.toLowerCase() : '';
        return nomLowerCase.includes(searchValue.toLowerCase())
            || villeLowerCase.includes(searchValue.toLowerCase())
    });
    nombreCoiffeurs.textContent = affichageEnseignes.length.toString();
    containerEnseigne.innerHTML = '';
    indexPage = 10;
    loadMoreEnseignes(affichageEnseignes);
}



function checkLogin()
{
    let isLogged = sessionStorage.getItem('isLoggedIn');
    console.log(isLogged);

    if (isLogged === 'true')
    {
        let addPersonButton = document.createElement('span');
        let imgAdd = document.createElement('img');
        imgAdd.src = 'img/addperson.svg';
        imgAdd.alt = 'add';
        imgAdd.id = 'add-icon';

        addPersonButton.appendChild(imgAdd);
        logImgContainer.appendChild(addPersonButton);






        let logoutButton = document.createElement('span');

        logoutButton.addEventListener('click', () =>
            {
                sessionStorage.setItem('isLoggedIn', 'false');
                window.location.reload();
            }
        );

        let imgLogout = document.createElement('img');
        imgLogout.src = 'img/logout.svg';
        imgLogout.alt = 'logout';
        imgLogout.id = 'logout-icon';

        logoutButton.appendChild(imgLogout);

        logImgContainer.appendChild(logoutButton);
    }else
    {
        let loginButton = document.createElement('a');
        loginButton.href = '/login.html';

        let imgLoggin = document.createElement('img');
        imgLoggin.src = 'img/login.svg';
        imgLoggin.alt = 'login';
        imgLoggin.id = 'login-icon';

        loginButton.appendChild(imgLoggin);

        logImgContainer.appendChild(loginButton);
    }
}




function init() {

    checkLogin();


    getEnseignes()
        .then(initialEnsignes => {
            enseignes = initialEnsignes;
            affichageEnseignes = enseignes;
            renderEnseignes(affichageEnseignes, 0, indexPage);
            indexPage += 10;
            nombreCoiffeurs.textContent = enseignes.length.toString();
        });
    window.addEventListener('scroll', checkScroll);
    inputRecherche.addEventListener('input', filterEnseignes);
}

init();
