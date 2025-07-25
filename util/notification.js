import Notification from "../models/notification.model.js";

export const sendNotification = async ({ userId, title, message, type = "General", createdBy = null }) => {
  return await Notification.create({
    user: userId,
    title,
    message,
    type,
    createdBy,
  });
};
