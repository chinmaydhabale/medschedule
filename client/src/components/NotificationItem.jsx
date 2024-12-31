import { useState } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

function NotificationItem({ notification }) {
    const [isRead, setIsRead] = useState(notification.isRead);

    const handleMarkAsRead = () => {
        api.put(`/api/notifications/${notification._id}/read`)
            .then(() => {
                setIsRead(true);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div className={`p-3 border-b ${isRead ? 'bg-white' : 'bg-blue-50'}`}>
            <div className="flex justify-between items-center">
                <p className="text-gray-800">{notification.message}</p>
                {!isRead && (
                    <button
                        onClick={handleMarkAsRead}
                        className="text-blue-500 text-sm hover:underline"
                    >
                        Mark as Read
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
        </div>
    );
}

export default NotificationItem;