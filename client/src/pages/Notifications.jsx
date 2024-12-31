import { useEffect, useState } from 'react';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then((res) => {
      setNotifications(res.data.notifications);
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  const handleMarkAsRead = (id) => {
    axios.put(`/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(() => {
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
    </div>
  );
}

export default Notifications;