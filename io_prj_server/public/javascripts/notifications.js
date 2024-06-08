function toggleNotifications() {
    var notificationsContainer = document.getElementById('notifications-container');
    var isVisible = notificationsContainer.style.display === 'block';
    notificationsContainer.style.display = isVisible ? 'none' : 'block';
    if (isVisible && notificationsContainer.innerHTML.trim() === '') {
      loadNotifications();
    }
  }
  
  function loadNotifications() {
    fetch('/user/notifications')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        var notificationsContainer = document.getElementById('notifications-container');
        notificationsContainer.innerHTML = html;
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }
  