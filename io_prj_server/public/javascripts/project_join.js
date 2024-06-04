document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.submit-button');
    const message_box = document.getElementById('info');
    const project_id = window.projectId;

    button.addEventListener('click', function() {
        const message = message_box.value;

        fetch(`/project/join/${project_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({project_id: project_id,  message: message })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(res.statusText);
            }
        })
        .then(() => {
            alert('Podanie wysłane!');
            window.location.href = `/project/id/${projectId}`;
        })
        .catch(err => {
            console.log(err);
        });
    });
});
