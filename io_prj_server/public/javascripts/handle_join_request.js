function handleJoinRequest(notificationId, projectId, fromUserId, accept) {
    fetch(`/project/notifications/${notificationId}/handle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accept: accept, project_id: projectId, from_user_id: fromUserId })
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