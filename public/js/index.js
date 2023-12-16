const templateEnseigne = document.getElementById('template-enseigne');
const containerEnseigne = document.getElementById('container-enseigne');
const nombreCoiffeurs = document.getElementById('nombre-coiffeur');
const inputRecherche = document.getElementById('input-recherche');
const dataSheetViewContainer = document.querySelector('.viewDataSheetContainer');
const dataSheetEditContainer = document.querySelector('.edit-company-container');
const logoutButton = document.getElementById('logout-icon');
const loginButton = document.getElementById('login-icon');
const addButton = document.getElementById('add-icon');

const leftContentContainer = document.querySelector('#leftContentContainer');
const currentDataSheetContainer = (localStorage.getItem('isLoggedIn') !== 'true') ? dataSheetViewContainer : dataSheetEditContainer;
const mapContainer = currentDataSheetContainer.querySelector('.mapContainer');
const editButton = currentDataSheetContainer.querySelector('#edit-coiffeur-submit');
const closeButton = currentDataSheetContainer.querySelector('.closeButton');
const modifLabel = currentDataSheetContainer.querySelector('#isModified');


let indexPage = 0;
let enseignes = [];
let filter = inputRecherche.value;
console.log(filter);

let resp = null;

function createMapFor(Lat, Lng) {
    mapContainer.innerHTML = ''; // Clear the map container
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
    if (currentDataSheetContainer.classList.contains('dataSheetOpened'))
    {
        closeButton.classList.add('disappearing');
    }
    currentDataSheetContainer.classList.remove('dataSheetOpened');
    leftContentContainer.classList.remove('givePlaceToRightContent');

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
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'),
            'id': localStorage.getItem('user_id')
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

    closeButton.classList.remove('disappearing', 'appearing');
    closeButton.classList.add(inRealSwitching ? 'stay' : 'appearing');

    closeButton.addEventListener('click', closeDataSheet);

    if (typeOfDataSheet === 'view') {
        fillViewDataSheet(currentInfos);
    } else {
        fillEditDataSheet(currentInfos, typeOfDataSheet);
        editButton.onclick = () => handleEditButtonClick(id, currentInfos, typeOfDataSheet, enseigne);
    }

    updateMapContainer(inRealSwitching, enseigne, mapLat, mapLng);

    leftContentContainer.classList.add('givePlaceToRightContent');
    currentDataSheetContainer.classList.add('dataSheetOpened');
}

function handleEditButtonClick(id, currentInfos, typeOfDataSheet, enseigne) {
    let newInfos = getNewInfosFromDataSheet();
    const data = prepareDataForRequest(id, currentInfos, newInfos);
    const resp = sendModifiedData(data, typeOfDataSheet);

    resp.then(response => handleResponse(response, typeOfDataSheet, newInfos, enseigne));
}

function getNewInfosFromDataSheet() {
    return [
        dataSheetEditContainer.querySelector('#nom').value,
        dataSheetEditContainer.querySelector('#numero').value,
        dataSheetEditContainer.querySelector('#voie').value,
        dataSheetEditContainer.querySelector('#code-postal').value,
        dataSheetEditContainer.querySelector('#ville').value,
        dataSheetEditContainer.querySelector('#latitude').value,
        dataSheetEditContainer.querySelector('#longitude').value
    ];
}

function prepareDataForRequest(id, currentInfos, newInfos) {
    return {
        id: id,
        ancientInfos: {
            nom: currentInfos[0],
            num: currentInfos[1],
            voie: currentInfos[2],
            codepostal: currentInfos[3],
            ville: currentInfos[4],
            lat: currentInfos[5],
            lng: currentInfos[6]
        },
        newInfos: {
            nom: newInfos[0],
            num: newInfos[1],
            voie: newInfos[2],
            codepostal: newInfos[3],
            ville: newInfos[4],
            lat: newInfos[5],
            lng: newInfos[6]
        }
    };
}

function handleResponse(response, typeOfDataSheet, newInfos, enseigne) {
    if (response.ok) {
        if (typeOfDataSheet === 'edit') {
            updateEnseigneInfos(enseigne, newInfos);
            editHtmlElement(newInfos, typeOfDataSheet);
        } else if (typeOfDataSheet === 'add') {
            response.json().then(data => {
                alert(data.message);
                window.location.reload();
            });
        }
    } else {
        response.json().then(data => alert(data.message));
    }
}

function updateEnseigneInfos(enseigne, newInfos) {
    enseigne.nom = newInfos[0];
    enseigne.num = newInfos[1];
    enseigne.voie = newInfos[2];
    enseigne.codepostal = newInfos[3];
    enseigne.ville = newInfos[4];
    enseigne.lat = newInfos[5];
    enseigne.lng = newInfos[6];
}

function updateMapContainer(inRealSwitching, enseigne, mapLat, mapLng) {
    if (currentDataSheetContainer.classList.contains('dataSheetOpened') && inRealSwitching && enseigne) {
        createMapFor(mapLat, mapLng);
    } else {
        mapContainer.innerHTML = '';
    }

    currentDataSheetContainer.addEventListener('transitionend', () => {
        if (currentDataSheetContainer.classList.contains('dataSheetOpened') && enseigne) {
            createMapFor(mapLat, mapLng);
        } else {
            mapContainer.innerHTML = '';
        }
    });
}

async function getEnseignes() {
    const response = await fetch(`/api/enseignes?index=${indexPage}&filter=${filter}`);
    const respJSON = await response.json();
    console.log(respJSON);
    return respJSON;
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
    enseigneElement.addEventListener('click', () => {
            if (localStorage.getItem('isLoggedIn') !== 'true') {
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

async function loadMoreEnseignes(enseignes) {
    let currentResp = await getEnseignes();
    let enseignesToAdd = currentResp.enseignes;
    enseignesToAdd.forEach(enseigne => enseignes.push(enseigne));

    console.log(enseignes);
    console.log("enseignes.length" + enseignes.length)
    renderEnseignes(enseignes, indexPage, indexPage+10);
    indexPage = enseignes.length;
    console.log("indexPage :" + indexPage)
}


function checkObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    };

    const observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                    loadMoreEnseignes(enseignes);
            }
        });
    }, options);

    observer.observe(document.getElementById('load-more-button'));
}

async function filterEnseignes() {
    closeDataSheet();
    filter = inputRecherche.value;
    enseignes = [];
    while (containerEnseigne.firstChild)
    {
        containerEnseigne.removeChild(containerEnseigne.firstChild);
    }
    await prepareTenFirstEnseignes();
    /*
    const searchValue = inputRecherche.value;
    enseignes = enseignes.filter(enseigne => {
        const nomLowerCase = enseigne.nom ? enseigne.nom.toLowerCase() : '';
        const villeLowerCase = enseigne.ville ? enseigne.ville.toLowerCase() : '';
        return nomLowerCase.includes(searchValue.toLowerCase())
            || villeLowerCase.includes(searchValue.toLowerCase())
    });
    nombreCoiffeurs.textContent = enseignes.length.toString();
    containerEnseigne.innerHTML = '';
    indexPage = 10;
    loadMoreEnseignes(enseignes);
     */
}


function checkLogin() {
    let isLogged = localStorage.getItem('isLoggedIn');
    if (isLogged === 'true') {
        loginButton.classList.add('hidden');
        logoutButton.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                localStorage.setItem('isLoggedIn', 'false');
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
    await prepareTenFirstEnseignes();
    checkObserver();
    inputRecherche.addEventListener('input', filterEnseignes);
}

async function prepareTenFirstEnseignes() {
    indexPage = 0;
    resp = await getEnseignes();
    enseignes = resp.enseignes;
    nombreCoiffeurs.textContent = resp.totalNumber.toString();
    renderEnseignes(enseignes, indexPage, indexPage + 10);
    indexPage = enseignes.length;
}



init();
