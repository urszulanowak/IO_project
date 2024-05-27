function project_publish() {
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    fetch('/project/publish', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, description: description })
    }).then(res => {
        if (!res.ok) {
            throw new Error(res.statusText);
        }
        return res.text();
    }).then(id => {
        window.location.href = `/project/id/${id}`;
    }).catch(err => {
        console.log(err);
        document.getElementById('error').innerText = err.message;
    });
}
window.project_publish = project_publish;