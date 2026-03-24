import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildResetTemplate(email: string, actionLink: string) {
  const safeEmail = escapeHtml(email);
  const safeLink = escapeHtml(actionLink);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f0f9ff; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px;">TripKey Password Reset</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">Secure account recovery email</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 15px;">Hi,</p>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.55;">
            We received a request to reset the password for <strong>${safeEmail}</strong>.
          </p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.55;">
            Click the button below to set your new password:
          </p>
          <a href="${safeLink}" style="display: inline-block; background: #0ea5e9; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 18px; border-radius: 8px;">Reset Password</a>
          <p style="margin: 24px 0 8px; font-size: 13px; color: #475569; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; font-size: 12px; color: #0284c7; word-break: break-all;">${safeLink}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `TripKey Password Reset\n\nWe received a request to reset password for ${email}.\n\nReset link: ${actionLink}\n\nIf you didn't request this, ignore this email.`;

  return { html, text };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      const missing = [
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)' : null,
        !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
      ].filter(Boolean);

      return NextResponse.json(
        { error: `Missing required config: ${missing.join(', ')}` },
        { status: 500 },
      );
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      request.nextUrl.origin;

    const redirectTo = `${appUrl}/auth/reset-password`;

    const hasSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);
    const smtpLooksLikePlaceholder =
      String(smtpUser || '').includes('your-email') ||
      String(smtpPass || '').includes('your-app-password');

    if (!hasSmtpConfig || smtpLooksLikePlaceholder) {
      return NextResponse.json(
        {
          error:
            'SMTP is not configured with real credentials. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
        },
        { status: 500 },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const actionLink =
      data?.properties?.action_link ||
      (data as unknown as { action_link?: string })?.action_link;

    if (!actionLink) {
      return NextResponse.json(
        { error: 'Could not generate password reset link for SMTP email.' },
        { status: 500 },
      );
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

    const { html, text } = buildResetTemplate(email, actionLink);

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'TripKey Password Reset',
      text,
      html,
    });

    return NextResponse.json({ success: true, provider: 'smtp' });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to send reset email.' },
      { status: 500 },
    );
  }
}
