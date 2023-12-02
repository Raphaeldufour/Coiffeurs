const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');
const logImgContainer = document.getElementById('logImgContainer');
const mainContainer = document.getElementById('main');
const leftContentContainer = document.getElementById('leftContentContainer');
const dataSheetViewContainer = document.querySelector('.viewDataSheetContainer');
const dataSheetEditContainer = document.querySelector('.edit-company-container');
const logoutButton = document.getElementById('logout-icon');
const loginButton = document.getElementById('login-icon');
const addButton = document.getElementById('add-icon');

const currentDataSheetContainer = (sessionStorage.getItem('isLoggedIn') !== 'true') ? dataSheetViewContainer : dataSheetEditContainer;
const mapContainer = currentDataSheetContainer.querySelector('.mapContainer');
const editButton = currentDataSheetContainer.querySelector('#edit-coiffeur-submit');
const closeButton = currentDataSheetContainer.querySelector('.closeButton');
const modifLabel = currentDataSheetContainer.querySelector('#isModified');

let indexPage = 10;
let enseignes = [];
let affichageEnseignes = [];


function dontContainsLetters(str) {
    return !/[a-zA-Z]/.test(str);
}

function containsDigits(string) {
    return /\d/.test(string);
}

function createMapFor(Lat, Lng) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGEyMjg2MjgiLCJhIjoiY2xwODFhNzhvMHc5eDJqbDY5eDk1eHRsdCJ9.G8pLJplueekCc7mvrKomTg'
    const map = new mapboxgl.Map({
        container: mapContainer, // container
        style: 'mapbox://styles/mapbox/satellite-streets-v12',// style URL
        center: [Lng, Lat],
        zoom: 18,
    });

    const marker = new mapboxgl.Marker()
        .setLngLat([Lng, Lat])
        .addTo(map);
}




function closeDataSheet() {
    closeButton.classList.remove('stay');
    closeButton.classList.remove('appearing');
    closeButton.classList.add('disappearing');

    currentDataSheetContainer.classList.remove('dataSheetOpened');

    currentDataSheetContainer.addEventListener('transitionend', (event) => {
        mapContainer.innerHTML = '';
    });

    let selectedElements = document.querySelectorAll('.selected');
    selectedElements.forEach(element => element.classList.remove('selected'));
}


function editHtmlElement(newData, typeOfDataSheet) {
    if (typeOfDataSheet === 'edit') {
        let element = document.querySelector('.selected');
        element.querySelector('.enseigne-coiffeur-nom').textContent = newData[0];
        element.querySelector('.enseigne-coiffeur-rue').textContent = newData[1] + ' ' + newData[2];
        element.querySelector('.enseigne-coiffeur-ville').textContent = newData[3] + ' ' + newData[4];
        modifLabel.classList.add('showIsModified'); // Ajoute la classe pour montrer lentement le message

        setTimeout(() => {
            modifLabel.classList.remove('showIsModified'); // Enlève la classe pour cacher lentement le message
        }, 2000);
    }
}


async function sendModifiedData(data, typeOfDataSheet) {
    let method = '';
    console.log(typeOfDataSheet);
    switch (typeOfDataSheet) {
        case 'edit':
            method = 'PATCH';
            break;
        case 'add':
            method = 'PUT';
            break;
    }

    const response = await fetch('api/enseignes', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return response;
}


function fillViewDataSheet(infos) {
    currentDataSheetContainer.querySelector('#valueName').textContent = infos[0];
    currentDataSheetContainer.querySelector('#valueNumber').textContent = infos[1];
    currentDataSheetContainer.querySelector('#valueWay').textContent = infos[2];
    currentDataSheetContainer.querySelector('#valuePostalCode').textContent = infos[3];
    currentDataSheetContainer.querySelector('#valueCity').textContent = infos[4];
}

function fillEditDataSheet(infos, typeOfDataSheet) {
    if (typeOfDataSheet === 'edit') {
        currentDataSheetContainer.querySelector('#nom').value = infos[0];
        currentDataSheetContainer.querySelector('#numero').value = infos[1];
        currentDataSheetContainer.querySelector('#voie').value = infos[2];
        currentDataSheetContainer.querySelector('#code-postal').value = infos[3];
        currentDataSheetContainer.querySelector('#ville').value = infos[4];
        currentDataSheetContainer.querySelector('#latitude').value = infos[5];
        currentDataSheetContainer.querySelector('#longitude').value = infos[6];
    } else if (typeOfDataSheet === 'add') {
        currentDataSheetContainer.querySelector('#nom').value = '';
        currentDataSheetContainer.querySelector('#numero').value = '';
        currentDataSheetContainer.querySelector('#voie').value = '';
        currentDataSheetContainer.querySelector('#code-postal').value = '';
        currentDataSheetContainer.querySelector('#ville').value = '';
        currentDataSheetContainer.querySelector('#latitude').value = '';
        currentDataSheetContainer.querySelector('#longitude').value = '';
    }
}


function generateRightContent(enseigne, typeOfDataSheet) {
    let currentInfos = [];
    let id = null;
    let mapLat = null;
    let mapLng = null;
    let inRealSwitching = getSwitchingState();
    if (enseigne !== null) {
        currentInfos = [enseigne.nom, enseigne.num, enseigne.voie, enseigne.codepostal, enseigne.ville, enseigne.lat, enseigne.lng];
        id = enseigne.id;
        mapLat = currentInfos[5];
        mapLng = currentInfos[6];
    }
    closeButton.classList.remove('disappearing');
    if (inRealSwitching === true) {
        closeButton.classList.remove('appearing');
        closeButton.classList.add('stay');
    } else {
        closeButton.classList.add('appearing');
    }

    closeButton.addEventListener('click', (e) => {
        closeDataSheet();
    });
    if (typeOfDataSheet === 'view') {
        fillViewDataSheet(currentInfos)
    } else {
        fillEditDataSheet(currentInfos, typeOfDataSheet)
        editButton.onclick = () => {
            let newInfos = [dataSheetEditContainer.querySelector('#nom').value, dataSheetEditContainer.querySelector('#numero').value, dataSheetEditContainer.querySelector('#voie').value, dataSheetEditContainer.querySelector('#code-postal').value, dataSheetEditContainer.querySelector('#ville').value, dataSheetEditContainer.querySelector('#latitude').value, dataSheetEditContainer.querySelector('#longitude').value];
                const data =
                    {
                        id: id,
                        ancientInfos:{
                            nom: currentInfos[0],
                            num: currentInfos[1],
                            voie: currentInfos[2],
                            codepostal: currentInfos[3],
                            ville: currentInfos[4],
                            lat: currentInfos[5],
                            lng: currentInfos[6]
                        },

                        newInfos:{
                            nom: newInfos[0],
                            num: newInfos[1],
                            voie: newInfos[2],
                            codepostal: newInfos[3],
                            ville: newInfos[4],
                            lat: newInfos[5],
                            lng: newInfos[6]
                        }

                    }
                const resp = sendModifiedData(data, typeOfDataSheet);
                resp.then(response => {
                    if (response.ok) {
                        if (typeOfDataSheet === 'edit') {

                            enseigne.nom = newInfos[0];
                            enseigne.num = newInfos[1];
                            enseigne.voie = newInfos[2];
                            enseigne.codepostal = newInfos[3];
                            enseigne.ville = newInfos[4];
                            enseigne.lat = newInfos[5];
                            enseigne.lng = newInfos[6];


                            mapLat = newInfos[5];
                            mapLng = newInfos[6];
                            currentInfos = newInfos;
                            editHtmlElement(newInfos, typeOfDataSheet)
                        }
                        else if (typeOfDataSheet === 'add')
                        {
                            response.json().then(data => {
                                alert(data.message)
                                window.location.reload();
                            });
                        }

                    }
                    else
                    {
                        const error = response.json()
                        error.then(data => {
                            alert(data.message)
                        })
                    }
                });
        }
    }
    if (currentDataSheetContainer.classList.contains('dataSheetOpened') === true && inRealSwitching === true && enseigne !== null) {
        createMapFor(mapLat, mapLng)
    } else {
        mapContainer.innerHTML = ''
    }
    currentDataSheetContainer.addEventListener('transitionend', (event) => {
        if (currentDataSheetContainer.classList.contains('dataSheetOpened') === true && enseigne !== null) {
            createMapFor(mapLat, mapLng)
        } else {
            mapContainer.innerHTML = ''
        }
    });
    currentDataSheetContainer.classList.add('dataSheetOpened');

}

async function getEnseignes() {
    const response = await fetch('/api/enseignes');
    const companies = await response.json();
    return companies;
}

function getSwitchingState() {
    let inSwitching = false;
    if (currentDataSheetContainer.classList.contains('dataSheetOpened') === true) {
        inSwitching = true;
    }
    return inSwitching;
}

function renderEnseigne(enseigne, index) {
    const clone = templateEnseigne.content.cloneNode(true);
    const enseigneElement = clone.querySelector('.enseigne-coiffeur');
    let typeOfDataSheet = '';
    clone.querySelector('.enseigne-coiffeur').addEventListener('click', () => {
            if (sessionStorage.getItem('isLoggedIn') !== 'true') {
                typeOfDataSheet = 'view';
            } else {
                typeOfDataSheet = 'edit';
            }

            if (enseigneElement.classList.contains('selected')) {
                console.log('lelement courant est déjà sélectionné')
                closeDataSheet();
                enseigneElement.classList.remove('selected');
            } else {
                let selectedElements = document.querySelectorAll('.selected');
                selectedElements.forEach(element => element.classList.remove('selected'));
                enseigneElement.classList.add('selected');
                generateRightContent(enseigne, typeOfDataSheet)
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
    nombreCoiffeurs.textContent = enseignes.length.toString();
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
    if (isLogged === 'true') {
        loginButton.classList.add('hidden');
        logoutButton.addEventListener('click', () => {
                sessionStorage.setItem('isLoggedIn', 'false');
                window.location.reload();
            }
        );
        addButton.addEventListener('click', () => {
            document.querySelector('.selected')?.classList.remove('selected');
            generateRightContent(null, 'add');
        });
    } else {
        logoutButton.classList.add('hidden');
        addButton.classList.add('hidden');
        loginButton.addEventListener('click', () => {
                window.location.href = '/login.html';
            }
        );
    }
}

async function init() {
    checkLogin();
    containerEnseigne.scrollTop = 0;
    enseignes = await getEnseignes();
    affichageEnseignes = enseignes;
    loadMoreEnseignes(affichageEnseignes);

    leftContentContainer.addEventListener('scroll', checkScroll);
    inputRecherche.addEventListener('input', filterEnseignes);
}

init();
