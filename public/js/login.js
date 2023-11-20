const emailContainer = document.getElementById("login-input");
const passwordContainer = document.getElementById("password-input");
const loginButton = document.getElementById("login-submit");
const cancelButton = document.getElementById("cancel-button");

let loginToEnter = "";
let passwordToEnter = "";



cancelButton.addEventListener("click", (click) => {
    sessionStorage.setItem('isLoggedIn', 'false');
    click.preventDefault();

    window.location.href = "http://localhost:3000";
});



function getUserNameAndPassword() {
    return fetch('/api/logintoenter').then(response => response.json())
}



getUserNameAndPassword().then((data) => {
    console.log(data);
    loginToEnter = data.login.email;
    passwordToEnter = data.login.mdp;

    loginButton.addEventListener("click", checkLoginAndPassword);
});

function checkLoginAndPassword(click) {
    click.preventDefault(); //Comme c'est un submit c'est pour empêcher le comportement par défaut (qui est de recharger la page)

    if (loginToEnter === emailContainer.value && passwordToEnter === passwordContainer.value) {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = "http://localhost:3000";
    } else {
        alert("Login ou mot de passe incorrect");
    }
}



