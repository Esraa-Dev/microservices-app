import ejs from 'ejs';
import path from 'path';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const renderEmailTemplate = async (
  templateName: string,
  data: any,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    'apps',
    'auth-service',
    'src',
    'utils',
    'emailTemplates',
    `${templateName}.ejs`,
  );
  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  email: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
