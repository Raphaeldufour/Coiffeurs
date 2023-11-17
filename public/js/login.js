const emailContainer = document.getElementById("login-input");
const passwordContainer = document.getElementById("password-input");
const loginButton = document.getElementById("login-submit");
const cancelButton = document.getElementById("cancel-button");

let loginToEnter = "";
let passwordToEnter = "";



cancelButton.addEventListener("click", () => {
    sessionStorage.setItem('isLoggedIn', 'false');
    event.preventDefault();
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

function checkLoginAndPassword() {
    event.preventDefault();

    if (loginToEnter === emailContainer.value && passwordToEnter === passwordContainer.value) {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = "http://localhost:3000";
    } else {
        alert("Login ou mot de passe incorrect");
    }
}



