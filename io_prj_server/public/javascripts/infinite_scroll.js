document.addEventListener('DOMContentLoaded', function () {
    display_projects();
    display_projects_if_empty_space();
});

document.addEventListener('scroll', async function () {
    display_projects_if_empty_space();
});

function display_projects_if_empty_space() {
    let content = document.getElementById('content');
    let content_bottom = content.getBoundingClientRect().bottom;
    if (content_bottom <= window.innerHeight + 300) {
        display_projects();
    }
}

function display_projects() {
    get_project_previews().then(project_previews => {
        let content = document.getElementById('content');
        content.innerHTML += project_previews;
    });
}

async function get_project_previews() {
    return await fetch('/project/get_project_previews', {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Get project previews error: ' + response.status);
        }
        return response.text();
    }).then(project_previews => {
        return project_previews;
    }).catch(err => {
        console.log(err);
    });
}
