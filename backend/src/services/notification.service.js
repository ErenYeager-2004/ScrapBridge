import prisma from "../config/prisma.js";

/**
 * createNotification
 * Creates a single Notification record for a given user.
 *
 * @param {string} userId  - The recipient user's UUID.
 * @param {string} message - Human-readable notification text.
 * @returns {Promise<Notification>} The created Notification record.
 */
export const createNotification = async (userId, message) => {
  return prisma.notification.create({
    data: {
      userId,
      message,
      read: false,
    },
  });
};
