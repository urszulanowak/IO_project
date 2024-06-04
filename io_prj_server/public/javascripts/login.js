document.getElementById('login-button').addEventListener('click', function (event) {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var pass = document.getElementById('pass').value;

    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            pass: pass
        })
    }).then(async response => {
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }).then(data => {
        window.location.href = '/'; // Przekierowanie po udanym zalogowaniu
    }).catch(error => {
        document.getElementById('error-message').innerText = error.message;
        document.getElementById('error-message').style.display = 'block';
    });
});
