const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');

const logImgContainer = document.getElementById('logImgContainer');

const mainContainer = document.getElementById('main');

const leftContentContainer = document.getElementById('leftContentContainer');


let indexPage = 10;
let enseignes = [];
let affichageEnseignes = [];


function createADataSheet(name, ANumber, AWayname, ACity, APostalCode, ALat, ALng) {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {

        let leftContentContainer = document.getElementById('leftContentContainer');

        leftContentContainer.style.width = '100%' ;
        let dataSheetContainer = document.getElementById('rightContentContainer');



        dataSheetContainer.classList.add('rightContentContainer');
        dataSheetContainer.classList.add('openingDataSheet');
        dataSheetContainer.innerText = '';
        dataSheetContainer.scrollTop = 0;


        let table = document.createElement('table');
        table.classList.add('dataSheetTable');
        let rows = [
            {label: 'Nom', value: name},
            {label: 'Numéro', value: ANumber},
            {label: 'Voie', value: AWayname},
            {label: 'Code postal', value: APostalCode},
            {label: 'Ville', value: ACity}
        ];

        rows.forEach(rowData => {
            let row = document.createElement('tr');

            let labelCell = document.createElement('td');
            labelCell.classList.add('labelCell');
            labelCell.textContent = rowData.label;
            labelCell.style.fontWeight = 'bold';

            let valueCell = document.createElement('td');
            valueCell.classList.add('valueCell');
            valueCell.textContent = rowData.value;
            if(rowData.label === 'Nom')
            {
                valueCell.style.fontWeight = 'bold';
            }

            row.appendChild(labelCell);
            row.appendChild(valueCell);

            table.appendChild(row);
        });


        dataSheetContainer.appendChild(table);

        let mapContainer = document.createElement('div');
        mapContainer.id = 'mapContainer';
        dataSheetContainer.appendChild(mapContainer);


        mapboxgl.accessToken = 'pk.eyJ1IjoibGEyMjg2MjgiLCJhIjoiY2xwODFhNzhvMHc5eDJqbDY5eDk1eHRsdCJ9.G8pLJplueekCc7mvrKomTg'
        const map = new mapboxgl.Map({
            container: 'mapContainer', // container ID
            style: 'mapbox://styles/mapbox/satellite-streets-v12',// style URL
            center: [ALng, ALat],
            zoom: 18,

        });

        const marker = new mapboxgl.Marker()
            .setLngLat([ALng, ALat])
            .addTo(map);


    }

}


function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json())
}

function renderEnseigne(enseigne, index) {
    const clone = templateEnseigne.content.cloneNode(true);


    clone.querySelector('.enseigne-coiffeur').addEventListener('click', () => {

            createADataSheet(enseigne.nom, enseigne.num ?? '', enseigne.voie, enseigne.ville, enseigne.codepostal, enseigne.lat, enseigne.lng);
        }
    )

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

    /*
    if ((window.scrollY + window.innerHeight) >= document.body.offsetHeight) {
        loadMoreEnseignes(affichageEnseignes);
    }
    */

    const container = document.getElementById('container-enseigne');
    const scrollableHeight = container.scrollHeight - container.clientHeight;
    const scrollTop = container.scrollTop;

    // La marge est à 20 pixels pour déclencher le chargement lorsque la barre est proche du bas
    if (scrollableHeight - scrollTop <= 20) {
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


function checkLogin() {
    let isLogged = sessionStorage.getItem('isLoggedIn');
    console.log(isLogged);

    if (isLogged === 'true') {
        let addPersonButton = document.createElement('span');
        let imgAdd = document.createElement('img');
        imgAdd.src = 'img/addperson.svg';
        imgAdd.alt = 'add';
        imgAdd.id = 'add-icon';

        addPersonButton.appendChild(imgAdd);
        logImgContainer.appendChild(addPersonButton);


        let logoutButton = document.createElement('span');

        logoutButton.addEventListener('click', () => {
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
    } else {
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
    containerEnseigne.scrollTop = 0;


    getEnseignes()
        .then(initialEnsignes => {
            enseignes = initialEnsignes;
            affichageEnseignes = enseignes;
            renderEnseignes(affichageEnseignes, 0, indexPage);
            indexPage += 10;
            nombreCoiffeurs.textContent = enseignes.length.toString();
        });
    containerEnseigne.addEventListener('scroll', checkScroll);
    inputRecherche.addEventListener('input', filterEnseignes);
}

init();
