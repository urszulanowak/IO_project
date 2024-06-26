document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.submit-button');
    const message_box = document.getElementById('info');
    const project_id = window.projectId;
    const error_div = document.getElementById('error');

    button.addEventListener('click', function () {
        const message = message_box.value;

        fetch('/project/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: project_id, message: message })
        }).then(async res => {
            if (!res.ok) {
                throw new Error(await res.text());
            }
        }).then(() => {
            alert('Podanie wysłane!');
            window.location.href = `/project/id/${project_id}`;
        }).catch(err => {
            error_div.textContent = err.message;
        });
    });
});
