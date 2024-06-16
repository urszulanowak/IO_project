function handleJoinRequest(project_id, user_id, accept) {
  fetch(`/project/join_requests/handle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accept: accept, project_id: project_id, user_id: user_id })
  }).then(response => {
    if (response.ok) {
      location.reload();
    } else {
      console.error('Failed to handle join request');
    }
  }).catch(error => {
    console.error('Error handling join request:', error);
  });
}