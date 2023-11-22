const templateEnseigne = document.getElementById('template-enseigne');
const templateEditCoiffeur = document.getElementById('template-edit-coiffeur');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');

const logImgContainer = document.getElementById('logImgContainer');

const mainContainer = document.getElementById('main');

const leftContentContainer = document.getElementById('leftContentContainer');
const dataSheetContainer = document.getElementById('rightContentContainer');

const dataSheetViewTemplate = document.getElementById('template-view-dataSheet');


let indexPage = 10;
let enseignes = [];
let affichageEnseignes = [];


function createMapFor(Lat, Lng)
{


    mapboxgl.accessToken = 'pk.eyJ1IjoibGEyMjg2MjgiLCJhIjoiY2xwODFhNzhvMHc5eDJqbDY5eDk1eHRsdCJ9.G8pLJplueekCc7mvrKomTg'
    const map = new mapboxgl.Map({
        container: 'mapContainer', // container ID
        style: 'mapbox://styles/mapbox/satellite-streets-v12',// style URL
        center: [Lng, Lat],
        zoom: 18,

    });

    const marker = new mapboxgl.Marker()
        .setLngLat([Lng, Lat])
        .addTo(map);

}


function createADataSheet(name, ANumber, AWayname, ACity, APostalCode, ALat, ALng) {
    dataSheetContainer.innerText = '';


    dataSheetContainer.style.width = '100%';
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {


        let closeButton = document.createElement('button');

        closeButton.id = 'closeButton';
        closeButton.classList.add('appears');
        closeButton.textContent = 'X';


        closeButton.addEventListener('click', (e) => {

            dataSheetContainer.style.width = '0%';
            closeButton.classList.remove('appears');
            closeButton.style.animation = 'disappearing 0.5s ease-in-out forwards'
            dataSheetContainer.classList.remove('dataSheetOpened');

            let selectedElements = document.querySelectorAll('.selected');
            selectedElements.forEach(element => element.classList.remove('selected'));
        });


        dataSheetViewTemplate.content.querySelector('#valueName').textContent = name;
        dataSheetViewTemplate.content.querySelector('#valueNumber').textContent = ANumber;
        dataSheetViewTemplate.content.querySelector('#valueWay').textContent = AWayname;
        dataSheetViewTemplate.content.querySelector('#valuePostalCode').textContent = APostalCode;
        dataSheetViewTemplate.content.querySelector('#valueCity').textContent = ACity;


        dataSheetContainer.appendChild(dataSheetViewTemplate.content.cloneNode(true));

        let closeButtonContainer = document.querySelector('#closeButtonContainer');
        closeButtonContainer.appendChild(closeButton);


        if (dataSheetContainer.classList.contains('dataSheetOpened')) {

            createMapFor(ALat, ALng)

        }
        else
        {
            dataSheetContainer.addEventListener('transitionend', (event) => {

                if(dataSheetContainer.style.width === '0%')
                {
                    dataSheetContainer.innerHTML = '';
                }
                else
                {
                    dataSheetContainer.classList.add('dataSheetOpened');
                    console.log('je suis passé dans l event listener');

                    createMapFor(ALat, ALng)
                }


            });


        }


    } else {
        templateEditCoiffeur.content.getElementById('nom').value = name;
        templateEditCoiffeur.content.getElementById('numero').value = ANumber;
        templateEditCoiffeur.content.getElementById('voie').value = AWayname;
        templateEditCoiffeur.content.getElementById('code-postal').value = APostalCode;
        templateEditCoiffeur.content.getElementById('ville').value = ACity;
        templateEditCoiffeur.content.getElementById('latitude').value = ALat;
        templateEditCoiffeur.content.getElementById('longitude').value = ALng;

        let clone = templateEditCoiffeur.content.cloneNode(true);
        dataSheetContainer.appendChild(clone);


    }

}


function getEnseignes() {
    return fetch('/api/enseignes')
        .then(response => response.json())
}

function renderEnseigne(enseigne, index) {



    const clone = templateEnseigne.content.cloneNode(true);

    let enseigneElement = clone.querySelector('.enseigne-coiffeur');

    clone.querySelector('.enseigne-coiffeur').addEventListener('click', () =>
        {


            if(enseigneElement.classList.contains('selected'))
            {
                enseigneElement.classList.remove('selected');
                dataSheetContainer.style.width = '0%';
                dataSheetContainer.classList.remove('dataSheetOpened');
            }
            else
            {
                let selectedElements = document.querySelectorAll('.selected');
                selectedElements.forEach(element => element.classList.remove('selected'));

                enseigneElement.classList.add('selected');
                createADataSheet(enseigne.nom, enseigne.num ?? '', enseigne.voie, enseigne.ville, enseigne.codepostal, enseigne.lat, enseigne.lng);
            }



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

    const container = document.getElementById('leftContentContainer');
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
    leftContentContainer.addEventListener('scroll', checkScroll);
    inputRecherche.addEventListener('input', filterEnseignes);
}

init();
