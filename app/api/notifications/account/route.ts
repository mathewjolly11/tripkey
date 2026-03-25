import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildRegistrationTemplate(name: string, roleLabel: string) {
  const safeName = escapeHtml(name || 'there');
  const safeRole = escapeHtml(roleLabel);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f0f9ff; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px;">Welcome to TripKey</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">Your account is ready</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 15px;">Hi ${safeName},</p>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.55;">
            Thanks for registering with TripKey. Your account is set up as <strong>${safeRole}</strong>.
          </p>
          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            If you have questions, reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `Welcome to TripKey\n\nHi ${name || 'there'},\nYour account is set up as ${roleLabel}.`;

  return { html, text };
}

function buildProviderApprovalTemplate(name: string, providerType: string) {
  const safeName = escapeHtml(name || 'there');
  const safeType = escapeHtml(providerType || 'provider');

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f0f9ff; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px;">Provider Approved</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">You can now access provider tools</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 15px;">Hi ${safeName},</p>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.55;">
            Your TripKey provider account has been approved as <strong>${safeType}</strong>.
          </p>
          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            You can now log in and start verifying bookings.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `Provider Approved\n\nHi ${name || 'there'},\nYour provider account has been approved as ${providerType || 'provider'}.`;

  return { html, text };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = String(body?.type || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const name = String(body?.name || '').trim();
    const providerType = String(body?.providerType || '').trim();
    const roleLabel = String(body?.roleLabel || '').trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    const hasSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);
    if (!hasSmtpConfig) {
      return NextResponse.json({ error: 'SMTP is not configured.' }, { status: 500 });
    }

    let subject = 'TripKey Update';
    let html = '';
    let text = '';

    if (type === 'registration') {
      subject = 'Welcome to TripKey';
      const template = buildRegistrationTemplate(name, roleLabel || 'Traveler');
      html = template.html;
      text = template.text;
    } else if (type === 'provider_approved') {
      subject = 'Your Provider Account is Approved';
      const template = buildProviderApprovalTemplate(name, providerType || 'provider');
      html = template.html;
      text = template.text;
    } else {
      return NextResponse.json({ error: 'Unknown notification type.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to send email.' },
      { status: 500 },
    );
  }
}
