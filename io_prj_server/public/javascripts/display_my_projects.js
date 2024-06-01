document.addEventListener('DOMContentLoaded', function () {
    display_projects();
});

async function display_projects() {
    try {
        const project_previews = await get_project_previews();
        let content = document.getElementById('content');
        if (project_previews.length === 0) {
            let message = document.createElement('h1');
            message.textContent = "Nie posiadasz jeszcze żadnych projektów!";
            content.appendChild(message);
        } else {
            content.innerHTML = project_previews;
        }
    } catch (err) {
        console.log(err);
    }
}

async function get_project_previews() {
    return await fetch('/project/get_my_projects', {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Get project previews error: ' + response.status);
        }
        return response.text();
    }).catch(err => {
        console.log(err);
    });
}
