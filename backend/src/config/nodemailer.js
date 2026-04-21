import nodemailer from "nodemailer";

/**
 * Reusable Nodemailer transporter.
 *
 * Reads EMAIL_USER and EMAIL_PASS from environment variables.
 * In development, point these at Mailtrap credentials.
 * In production, swap host/port for your real SMTP provider (e.g. Gmail).
 *
 * Gmail example:
 *   EMAIL_USER = youraddress@gmail.com
 *   EMAIL_PASS = <Google App Password>  (enable 2-FA first)
 *
 * Mailtrap example:
 *   EMAIL_USER = <mailtrap username>
 *   EMAIL_PASS = <mailtrap password>
 *   and change host/port below to smtp.mailtrap.io / 2525
 */
const transporter = nodemailer.createTransport({
  service: "gmail", // swap to custom host/port for Mailtrap (see comment above)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;
