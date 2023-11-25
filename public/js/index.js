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


function dontContainsLetters(str) {
    return !/[a-zA-Z]/.test(str);
}

function containsDigits(string) {
    return /\d/.test(string);
}

function createMapFor(Lat, Lng) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGEyMjg2MjgiLCJhIjoiY2xwODFhNzhvMHc5eDJqbDY5eDk1eHRsdCJ9.G8pLJplueekCc7mvrKomTg'
    const map = new mapboxgl.Map({
        container: document.querySelector('.mapContainer'), // container
        style: 'mapbox://styles/mapbox/satellite-streets-v12',// style URL
        center: [Lng, Lat],
        zoom: 18,
    });

    const marker = new mapboxgl.Marker()
        .setLngLat([Lng, Lat])
        .addTo(map);
}


function okayForEdit(ancientInfos, newInfos) {
    isOkay = true;
    if (
        isNaN(newInfos[1]) || newInfos[1].includes(' ') || newInfos[1] === '' ||
        isNaN(newInfos[3]) || newInfos[3].includes(' ') || newInfos[3] === '' ||
        isNaN(newInfos[5]) || newInfos[5].includes(' ') || newInfos[5] === '' || Math.abs(parseFloat(newInfos[5])) > 90 ||
        isNaN(newInfos[6]) || newInfos[6].includes(' ') || newInfos[6] === '' || Math.abs(parseFloat(newInfos[6])) > 180
    ) {
        isOkay = false;
    } else if (
        dontContainsLetters(newInfos[0]) ||
        dontContainsLetters(newInfos[2]) ||
        dontContainsLetters(newInfos[4]) || containsDigits(newInfos[4])
    ) {
        isOkay = false;
    } else {
        console.log(parseFloat(dataSheetContainer.querySelector('#latitude').value))
        console.log(parseFloat(dataSheetContainer.querySelector('#longitude').value))
        for (let i = 0; i < newInfos.length; i++) {
            if (newInfos[i] !== ancientInfos[i]) {
                isOkay = true
                console.log('changements');
                break

            } else {
                isOkay = false;
                console.log('pas changement');
            }
        }
    }
    return isOkay;
}


function editHtmlElement(element, newData, modifLabel) {
    element.querySelector('.enseigne-coiffeur-nom').textContent = newData[0];
    element.querySelector('.enseigne-coiffeur-rue').textContent = newData[1] + ' ' + newData[2];
    element.querySelector('.enseigne-coiffeur-ville').textContent = newData[3] + ' ' + newData[4];
    modifLabel.classList.add('showIsModified'); // Ajoute la classe pour montrer lentement le message

    setTimeout(() => {
        modifLabel.classList.remove('showIsModified'); // Enlève la classe pour cacher lentement le message
    }, 2000);
}


async function sendModifiedData(data) {
    const response = await fetch('api/enseignes/${id}', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    return response
}


function createADataSheet(enseigneElement, enseigne, inSwitching) {
    let currentInfos = [enseigne.nom, enseigne.num, enseigne.voie, enseigne.codepostal, enseigne.ville, enseigne.lat, enseigne.lng];
    id = enseigne.id;
    console.log(id);
    let name = enseigne.nom;
    let ANumber = enseigne.num;
    let AWayname = enseigne.voie;
    let APostalCode = enseigne.codepostal;
    let ACity = enseigne.ville;
    let ALat = enseigne.lat;
    let ALng = enseigne.lng;


    dataSheetContainer.innerText = '';
    dataSheetContainer.classList.add('dataSheetOpened');

    let closeButton = document.createElement('button');
    console.log(inSwitching);

    closeButton.id = 'closeButton';
    if (inSwitching === true) {
        closeButton.classList.remove('appearing')
        closeButton.classList.remove('disappearing')
    } else {
        closeButton.classList.add('appearing');
    }
    closeButton.textContent = 'X';

    closeButton.addEventListener('click', (e) => {
        dataSheetContainer.classList.remove('dataSheetOpened');
        closeButton.classList.remove('appearing');
        closeButton.classList.add('disappearing');
        dataSheetContainer.classList.remove('dataSheetOpened');

        let selectedElements = document.querySelectorAll('.selected');
        selectedElements.forEach(element => element.classList.remove('selected'));
    });
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        dataSheetViewTemplate.content.querySelector('#valueName').textContent = name;
        dataSheetViewTemplate.content.querySelector('#valueNumber').textContent = ANumber;
        dataSheetViewTemplate.content.querySelector('#valueWay').textContent = AWayname;
        dataSheetViewTemplate.content.querySelector('#valuePostalCode').textContent = APostalCode;
        dataSheetViewTemplate.content.querySelector('#valueCity').textContent = ACity;

        dataSheetContainer.appendChild(dataSheetViewTemplate.content.cloneNode(true));
        let closeButtonContainer = document.querySelector('.closeButtonContainer');
        closeButtonContainer.appendChild(closeButton);
    }
    else
    {
        templateEditCoiffeur.content.getElementById('nom').value = name;
        templateEditCoiffeur.content.getElementById('numero').value = ANumber;
        templateEditCoiffeur.content.getElementById('voie').value = AWayname;
        templateEditCoiffeur.content.getElementById('code-postal').value = APostalCode;
        templateEditCoiffeur.content.getElementById('ville').value = ACity;
        templateEditCoiffeur.content.getElementById('latitude').value = ALat;
        templateEditCoiffeur.content.getElementById('longitude').value = ALng;




        let clone = templateEditCoiffeur.content.cloneNode(true);
        let modifLabel = clone.querySelector('#isModified');
        dataSheetContainer.appendChild(clone);

        let closeButtonContainer = document.querySelector('.closeButtonContainer');
        closeButtonContainer.appendChild(closeButton);

        let editButton = document.getElementById('edit-coiffeur-submit');

        editButton.addEventListener('click', () => {
            let newInfos = [dataSheetContainer.querySelector('#nom').value, dataSheetContainer.querySelector('#numero').value, dataSheetContainer.querySelector('#voie').value, dataSheetContainer.querySelector('#code-postal').value, dataSheetContainer.querySelector('#ville').value, dataSheetContainer.querySelector('#latitude').value, dataSheetContainer.querySelector('#longitude').value];

            if (okayForEdit(currentInfos, newInfos) === true) {
                const data = {
                    id: id,
                    name: newInfos[0],
                    num: newInfos[1],
                    voie: newInfos[2],
                    codepostal: newInfos[3],
                    ville: newInfos[4],
                    lat: newInfos[5],
                    lng: newInfos[6]
                }
                const resp = sendModifiedData(data);
                resp.then(response => {
                    if (response.ok) {
                        enseigne.nom = newInfos[0];
                        enseigne.num = newInfos[1];
                        enseigne.voie = newInfos[2];
                        enseigne.codepostal = newInfos[3];
                        enseigne.ville = newInfos[4];
                        enseigne.lat = newInfos[5];
                        enseigne.lng = newInfos[6];
                        currentInfos = newInfos;
                        ALat = newInfos[5];
                        ALng = newInfos[6];
                        currentInfos = newInfos;
                        editHtmlElement(enseigneElement, newInfos, modifLabel)
                    } else {
                        const error = response.json();
                        alert(error.message);
                    }
                });

            } else {
                alert("Problème: certains champs n'ont pas été remplis correctement")
            }

        });

    }


    if (dataSheetContainer.classList.contains('dataSheetOpened') === true && inSwitching === true) {
        createMapFor(ALat, ALng)
    }

    dataSheetContainer.addEventListener('transitionend', (event) => {
        if (dataSheetContainer.classList.contains('dataSheetOpened') === false) {
            dataSheetContainer.innerText = '';
        } else {
            dataSheetContainer.classList.add('dataSheetOpened');
            console.log('je suis passé dans l event listener');

            createMapFor(ALat, ALng)
        }
    });

}

async function getEnseignes() {
    const response = await fetch('/api/enseignes');
    const companies = await response.json();
    return companies;
}

function renderEnseigne(enseigne, index) {
    const clone = templateEnseigne.content.cloneNode(true);
    let enseigneElement = clone.querySelector('.enseigne-coiffeur');

    clone.querySelector('.enseigne-coiffeur').addEventListener('click', () =>
        {

            let inSwitching = false;
            if ((document.querySelectorAll('.selected')).length === 1) {
                inSwitching = true;
            }
            if (enseigneElement.classList.contains('selected')) {
                let closeButtun = document.getElementById('closeButton');
                closeButtun.click();
                enseigneElement.classList.remove('selected');
            } else
            {
                let selectedElements = document.querySelectorAll('.selected');
                selectedElements.forEach(element => element.classList.remove('selected'));
                enseigneElement.classList.add('selected');
                createADataSheet(enseigneElement,enseigne, inSwitching);
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
