function toggleNotifications() {
  const notificationsContainer = document.getElementById('notifications-container');
  if (notificationsContainer.style.display === 'none' || notificationsContainer.style.display === '') {
      notificationsContainer.style.display = 'block';
      fetchNotifications();
  } else {
      notificationsContainer.style.display = 'none';
  }
}

async function fetchNotifications() {
  try {
      const response = await fetch('/user/notifications');
      if (response.ok) {
          const notifications = await response.text();
          document.getElementById('notifications-container').innerHTML = notifications;
      } else {
          console.error('Failed to fetch notifications');
      }
  } catch (error) {
      console.error('Error fetching notifications:', error);
  }
}
