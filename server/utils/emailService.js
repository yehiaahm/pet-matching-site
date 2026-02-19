import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../config/logger.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If SMTP not configured, just log the email
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.info('📧 Email (not sent - SMTP not configured):', { to, subject });
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const info = await transporter.sendMail({
      from: `"PetMat" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to PetMat!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Welcome to PetMat! 🐾</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for joining PetMat - the best pet breeding matchmaking platform!</p>
      <p>You can now:</p>
      <ul>
        <li>Create profiles for your pets</li>
        <li>Find perfect breeding matches</li>
        <li>Connect with other pet owners</li>
        <li>Track health records</li>
      </ul>
      <p style="margin-top: 20px;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" 
           style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Get Started
        </a>
      </p>
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Welcome to PetMat, ${user.firstName}!`,
  });
};

/**
 * Send breeding request notification
 */
export const sendBreedingRequestEmail = async (targetUser, initiatorUser, initiatorPet, targetPet) => {
  const subject = 'New Breeding Request on PetMat';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">New Breeding Request 🐾</h1>
      <p>Hi ${targetUser.firstName},</p>
      <p>${initiatorUser.firstName} ${initiatorUser.lastName} has sent a breeding request for your pet <strong>${targetPet.name}</strong>!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Request Details:</h3>
        <p><strong>Their Pet:</strong> ${initiatorPet.name} (${initiatorPet.breed})</p>
        <p><strong>Your Pet:</strong> ${targetPet.name} (${targetPet.breed})</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" 
           style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Request
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: targetUser.email,
    subject,
    html,
    text: `${initiatorUser.firstName} sent you a breeding request!`,
  });
};

/**
 * Send breeding request accepted notification
 */
export const sendRequestAcceptedEmail = async (initiatorUser, targetUser, initiatorPet, targetPet) => {
  const subject = 'Breeding Request Accepted!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10B981;">Request Accepted! 🎉</h1>
      <p>Hi ${initiatorUser.firstName},</p>
      <p>Great news! ${targetUser.firstName} ${targetUser.lastName} has accepted your breeding request!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Your Pet:</strong> ${initiatorPet.name}</p>
        <p><strong>Their Pet:</strong> ${targetPet.name}</p>
      </div>
      <p>You can now message ${targetUser.firstName} to coordinate the details.</p>
      <p style="margin-top: 20px;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" 
           style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Details
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: initiatorUser.email,
    subject,
    html,
    text: `Your breeding request was accepted by ${targetUser.firstName}!`,
  });
};

/**
 * Send new message notification
 */
export const sendNewMessageEmail = async (recipient, sender, messagePreview) => {
  const subject = 'New Message on PetMat';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">New Message 💬</h1>
      <p>Hi ${recipient.firstName},</p>
      <p>You have a new message from ${sender.firstName} ${sender.lastName}:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-style: italic;">"${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" 
           style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Read Message
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text: `New message from ${sender.firstName}: ${messagePreview}`,
  });
};

/**
 * Send review notification
 */
export const sendReviewNotificationEmail = async (reviewee, reviewer, rating) => {
  const subject = 'New Review on PetMat';
  const stars = '⭐'.repeat(rating);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">New Review ${stars}</h1>
      <p>Hi ${reviewee.firstName},</p>
      <p>${reviewer.firstName} ${reviewer.lastName} left you a ${rating}-star review!</p>
      <p style="margin-top: 20px;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" 
           style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Review
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: reviewee.email,
    subject,
    html,
    text: `${reviewer.firstName} left you a ${rating}-star review!`,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendBreedingRequestEmail,
  sendRequestAcceptedEmail,
  sendNewMessageEmail,
  sendReviewNotificationEmail,
};
