import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, title, message, type, relatedId }) => {
  return Notification.create({ recipient, title, message, type, relatedId });
};

export const notifyUser = async (userId, title, message, type = 'system', relatedId = null) => {
  return createNotification({ recipient: userId, title, message, type, relatedId });
};
