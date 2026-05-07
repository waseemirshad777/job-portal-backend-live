const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Initialize transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Email template for email verification
 */
const emailVerificationTemplate = (username, verificationLink) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #4CAF50;">Email Verification</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Thank you for registering with us! To complete your registration and verify your email address, please click the link below:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
                </div>
                <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationLink}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
                <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
            </div>
        </div>
    `;
};

/**
 * Email template for password reset
 */
const passwordResetTemplate = (username, resetLink) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #FF9800;">Password Reset Request</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>We received a request to reset your password. Click the link below to set a new password:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${resetLink}" style="background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    `;
};

/**
 * Email template for contact confirmation
 */
const contactConfirmationTemplate = (name, message) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #2196F3;">Message Received</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Your Message:</strong></p>
                    <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you have any additional questions, feel free to reply to this email.</p>
            </div>
        </div>
    `;
};

const subscriptionConfirmationTemplate = () => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #9C27B0;">Subscription Confirmed</h2>
                <p>Hello <strong>Dear</strong>,</p>
                <p>Thank you for subscribing to Job Box updates.</p>
                <p>You will now receive the latest:</p>
                <ul style="padding-left: 20px;">
                    <li>New job opportunities</li>
                    <li>Career tips and resources</li>
                    <li>Platform updates</li>
                    <li>Special announcements</li>
                </ul>
                <div style="margin: 30px 0; text-align: center;">
                    <span style="background-color: #9C27B0; color: white; padding: 12px 24px; border-radius: 4px; display: inline-block;">
                        Welcome to Our Community
                    </span>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you did not subscribe, you can safely ignore this email.
                </p>
                <p style="color: #999; font-size: 12px;">
                    Thank you for joining us.
                </p>
            </div>
        </div>
    `;
};

const newJobPostedTemplate = (jobDetails, websiteUrl) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 650px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #4CAF50;">New Job Opportunity Posted</h2>

                <p>Hello <strong>Subscriber</strong>,</p>

                <p>A new job matching potential opportunities has just been posted on Job Box.</p>

                <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <p><strong>Job Title:</strong> ${jobDetails.title}</p>
                    <p><strong>Company:</strong> ${jobDetails.company}</p>
                    <p><strong>Location:</strong> ${jobDetails.location}</p>
                    <p><strong>Job Type:</strong> ${jobDetails.jobType}</p>
                    <p><strong>Category:</strong> ${jobDetails.jobCategory}</p>
                    ${
                        jobDetails.salaryFrom || jobDetails.salaryTo
                            ? `<p><strong>Salary:</strong> ${jobDetails.salaryFrom || ''} - ${jobDetails.salaryTo || ''} ${jobDetails.salaryCurrency || ''}</p>`
                            : ''
                    }
                </div>

                <div style="margin: 30px 0; text-align: center;">
                    <a href="${websiteUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        View Job & Apply
                    </a>
                </div>

                <p style="font-size: 14px; color: #666;">
                    Stay connected for more career opportunities.
                </p>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    You are receiving this email because you subscribed to Job Box updates.
                </p>
            </div>
        </div>
    `;
};

const jobApplicationTemplate = (applicationDetails) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 650px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #2196F3;">New Job Application Received</h2>

                <p>Hello Hiring Team,</p>

                <p>A new candidate has applied for your job posting.</p>

                <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0;">
                    <p><strong>Applicant Name:</strong> ${applicationDetails.fullName}</p>
                    <p><strong>Email:</strong> ${applicationDetails.email}</p>
                    <p><strong>Job Title:</strong> ${applicationDetails.jobTitle}</p>
                    <p><strong>Company:</strong> ${applicationDetails.employerCompany}</p>
                </div>

                <p>The applicant's resume is attached with this email for review.</p>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This application was submitted through Job Box.
                </p>
            </div>
        </div>
    `;
};

/**
 * Main email service object with different methods
 */
const emailService = {
    /**
     * Generate a random token for verification/reset
     */
    generateToken: () => {
        return crypto.randomBytes(32).toString('hex');
    },

    /**
     * Send email verification email
     * @param {string} recipientEmail - User's email address
     * @param {string} username - User's username
     * @param {string} verificationToken - Unique verification token
     * @param {string} baseUrl - Base URL for the verification link (e.g., http://localhost:5173)
     * @returns {Promise<object>} - Result of email sending
     */
    sendVerificationEmail: async (recipientEmail, username, verificationToken, baseUrl) => {
        try {
            const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
            
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: recipientEmail,
                subject: 'Email Verification - Job Box',
                html: emailVerificationTemplate(username, verificationLink)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('[EmailService] Verification email sent to:', recipientEmail);
            return { success: true, message: 'Verification email sent successfully', result };
        } catch (error) {
            console.error('[EmailService] Error sending verification email:', error);
            return { success: false, message: 'Failed to send verification email', error };
        }
    },

    /**
     * Send password reset email
     * @param {string} recipientEmail - User's email address
     * @param {string} username - User's username
     * @param {string} resetToken - Unique reset token
     * @param {string} baseUrl - Base URL for the reset link
     * @returns {Promise<object>} - Result of email sending
     */
    sendPasswordResetEmail: async (recipientEmail, username, resetToken, baseUrl) => {
        try {
            const resetLink = `${baseUrl}/reset-password/${resetToken}`;

            const mailOptions = {
                from: process.env.SMTP_USER,
                to: recipientEmail,
                subject: 'Password Reset - Job Box',
                html: passwordResetTemplate(username, resetLink)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('[EmailService] Password reset email sent to:', recipientEmail);
            return { success: true, message: 'Password reset email sent successfully', result };
        } catch (error) {
            console.error('[EmailService] Error sending password reset email:', error);
            return { success: false, message: 'Failed to send password reset email', error };
        }
    },

    /**
     * Send contact form confirmation email
     * @param {string} recipientEmail - User's email address
     * @param {string} name - User's name
     * @param {string} message - User's message
     * @returns {Promise<object>} - Result of email sending
     */
    sendContactConfirmationEmail: async (recipientEmail, name, message) => {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: recipientEmail,
                subject: 'We received your message - Job Box',
                html: contactConfirmationTemplate(name, message)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('[EmailService] Contact confirmation email sent to:', recipientEmail);
            return { success: true, message: 'Confirmation email sent successfully', result };
        } catch (error) {
            console.error('[EmailService] Error sending contact confirmation email:', error);
            return { success: false, message: 'Failed to send confirmation email', error };
        }
    },

    sendSubscriptionConfirmationEmail: async (recipientEmail) => {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: recipientEmail,
                subject: 'Subscription Confirmed - Job Box',
                html: subscriptionConfirmationTemplate()
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('[EmailService] Subscription confirmation email sent to:', recipientEmail);

            return {
                success: true,
                message: 'Subscription confirmation email sent successfully',
                result
            };
        } catch (error) {
            console.error('[EmailService] Error sending subscription confirmation email:', error);

            return {
                success: false,
                message: 'Failed to send subscription confirmation email',
                error
            };
        }
    },

    /**
     * Send a custom email
     * @param {string} recipientEmail - Recipient's email
     * @param {string} subject - Email subject
     * @param {string} html - HTML email content
     * @returns {Promise<object>} - Result of email sending
     */
    sendCustomEmail: async (recipientEmail, subject, html) => {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: recipientEmail,
                subject,
                html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('[EmailService] Custom email sent to:', recipientEmail);
            return { success: true, message: 'Email sent successfully', result };
        } catch (error) {
            console.error('[EmailService] Error sending custom email:', error);
            return { success: false, message: 'Failed to send email', error };
        }
    },

    sendNewJobPostedEmail: async (subscriberEmails, jobDetails, websiteUrl) => {
        try {
            if (!subscriberEmails || subscriberEmails.length === 0) {
                return {
                    success: false,
                    message: "No subscribers found"
                };
            }
        
            const mailOptions = {
                from: process.env.SMTP_USER,
                bcc: subscriberEmails,
                subject: `New Job Posted - ${jobDetails.title}`,
                html: newJobPostedTemplate(jobDetails, websiteUrl)
            };
        
            const result = await transporter.sendMail(mailOptions);
        
            console.log('[EmailService] New job alert sent to subscribers');
        
            return {
                success: true,
                message: 'New job alert sent successfully',
                result
            };
        
        } catch (error) {
            console.error('[EmailService] Error sending new job alert:', error);
        
            return {
                success: false,
                message: 'Failed to send new job alert',
                error
            };
        }
    },

    sendJobApplicationEmail: async (applicationDetails, resumePath) => {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                replyTo: applicationDetails.email,
                to: applicationDetails.applyEmail,
                subject: `Job Application - ${applicationDetails.jobTitle}`,
                html: jobApplicationTemplate(applicationDetails),
                attachments: [
                    {
                        path: resumePath
                    }
                ]
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('[EmailService] Job application sent to:', applicationDetails.applyEmail);

            return {
                success: true,
                message: 'Job application sent successfully',
                result
            };

        } catch (error) {
            console.error('[EmailService] Error sending job application:', error);

            return {
                success: false,
                message: 'Failed to send job application',
                error
            };
        }
    },
};

module.exports = emailService;
