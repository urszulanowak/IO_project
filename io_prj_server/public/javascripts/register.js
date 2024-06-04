document.getElementById('register-button').addEventListener('click', function (event) {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var name = document.getElementById('name').value;
    var pass = document.getElementById('pass').value;
    var confirmPass = document.getElementById('confirm_pass').value;
    var birthDate = document.getElementById('birth_date').value;
    var gender = document.getElementById('gender').value;

    if (pass !== confirmPass) {
        document.getElementById('error-message').innerText = 'Hasła nie są takie same!';
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    fetch('/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            name: name,
            pass: pass,
            confirm_pass: confirmPass,
            birth_date: birthDate,
            gender: gender
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Błąd rejestracji! ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        window.location.href = '/user/login'; // Przekierowanie po udanej rejestracji
    })
    .catch(error => {
        document.getElementById('error-message').innerText = error.message;
        document.getElementById('error-message').style.display = 'block';
    });
});
