import { Resend } from "resend";

// Initialize Resend client (fallback to mock in development if no API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInvitationEmail({
  email,
  workspaceName,
  invitationToken,
  role,
}: {
  email: string;
  workspaceName: string;
  invitationToken: string;
  role: "OWNER_CCO" | "MEMBER";
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const invitationUrl = `${baseUrl}/invitations/accept?token=${invitationToken}`;

  const emailContent = {
    from: process.env.EMAIL_FROM || "noreply@ria-compliance.com",
    to: email,
    subject: `Invitation to join ${workspaceName} on Comply Vault`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join ${workspaceName}</h2>
        <p>You've been invited to join the workspace <strong>${workspaceName}</strong> on Comply Vault with the role: <strong>${role === "OWNER_CCO" ? "Owner/CCO" : "Member"}</strong>.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Accept Invitation
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This invitation will expire in 7 days.</p>
      </div>
    `,
    text: `
      You've been invited to join ${workspaceName} on Comply Vault.
      
      Role: ${role === "OWNER_CCO" ? "Owner/CCO" : "Member"}
      
      Accept your invitation by visiting:
      ${invitationUrl}
      
      This invitation will expire in 7 days.
    `,
  };

  // In development without Resend API key, log the email instead
  if (!resend) {
    console.log("📧 [DEV MODE] Invitation email would be sent:");
    console.log("To:", email);
    console.log("Subject:", emailContent.subject);
    console.log("Invitation URL:", invitationUrl);
    return { success: true, id: "dev-mode" };
  }

  try {
    const result = await resend.emails.send(emailContent);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return { success: true, id: result.data?.id || "sent" };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("Failed to send invitation email");
  }
}

/**
 * Send welcome email with onboarding checklist when workspace is provisioned
 */
export async function sendWelcomeEmail({
  email,
  workspaceName,
  userName,
  setupFee,
  pilotCode,
}: {
  email: string;
  workspaceName: string;
  userName: string;
  setupFee: number;
  pilotCode: string | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard`;
  const settingsUrl = `${baseUrl}/settings`;
  const uploadUrl = `${baseUrl}/upload`;

  const emailContent = {
    from: process.env.EMAIL_FROM || "noreply@ria-compliance.com",
    to: email,
    subject: `Welcome to Comply Vault - ${workspaceName} Pilot Setup`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2>Welcome to Comply Vault, ${userName}!</h2>
        <p>Your pilot workspace <strong>${workspaceName}</strong> has been successfully created.</p>
        
        ${setupFee > 0 ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Next Step:</strong> Complete your $500 setup fee to activate your 60-day free pilot period.</p>
          </div>
        ` : `
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Pilot Activated:</strong> Your 60-day free pilot period has started!</p>
          </div>
        `}
        
        <h3 style="margin-top: 30px 0 15px 0;">Onboarding Checklist</h3>
        <p>Get started with these steps:</p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">
            <strong>Complete Workspace Setup</strong><br>
            <a href="${settingsUrl}" style="color: #2563eb;">Configure retention settings and legal hold</a>
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Invite Team Members</strong><br>
            Add your team members and assign roles (Owner/CCO or Member)
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Upload Your First Meeting</strong><br>
            <a href="${uploadUrl}" style="color: #2563eb;">Upload a meeting recording</a> to see the system in action
          </li>
          <li style="margin-bottom: 10px;">
            <strong>Review and Finalize</strong><br>
            Review the extracted fields, make any edits, and finalize your first record
          </li>
        </ol>
        
        <div style="margin: 30px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p><strong>Pilot Period:</strong> Your 60-day free pilot period starts today and includes full access to all features.</p>
          <p><strong>Support:</strong> If you need help, reply to this email or contact support@complyvault.com</p>
        </div>
      </div>
    `,
    text: `
      Welcome to Comply Vault, ${userName}!
      
      Your pilot workspace ${workspaceName} has been successfully created.
      
      ${setupFee > 0 ? `Next Step: Complete your $500 setup fee to activate your 60-day free pilot period.` : `Pilot Activated: Your 60-day free pilot period has started!`}
      
      Onboarding Checklist:
      1. Complete Workspace Setup: ${settingsUrl}
      2. Invite Team Members: Add your team members and assign roles
      3. Upload Your First Meeting: ${uploadUrl}
      4. Review and Finalize: Review the extracted fields and finalize your first record
      
      Go to Dashboard: ${dashboardUrl}
      
      Pilot Period: Your 60-day free pilot period starts today and includes full access to all features.
      Support: If you need help, reply to this email or contact support@complyvault.com
    `,
  };

  // In development without Resend API key, log the email instead
  if (!resend) {
    console.log("📧 [DEV MODE] Welcome email would be sent:");
    console.log("To:", email);
    console.log("Subject:", emailContent.subject);
    console.log("Workspace:", workspaceName);
    return { success: true, id: "dev-mode" };
  }

  try {
    const result = await resend.emails.send(emailContent);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return { success: true, id: result.data?.id || "sent" };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - email failures shouldn't block the workflow
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send email notification when meeting draft is ready for review
 */
export async function sendDraftReadyEmail({
  email,
  clientName,
  meetingDate,
  meetingId,
}: {
  email: string;
  clientName: string;
  meetingDate: Date;
  meetingId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const meetingUrl = `${baseUrl}/meetings/${meetingId}`;

  const emailContent = {
    from: process.env.EMAIL_FROM || "noreply@ria-compliance.com",
    to: email,
    subject: `Draft Ready for Review: ${clientName} - ${meetingDate.toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Meeting Draft is Ready for Review</h2>
        <p>The transcription for your meeting with <strong>${clientName}</strong> on <strong>${meetingDate.toLocaleDateString()}</strong> is complete and ready for your review.</p>
        <p>Click the button below to review and finalize the meeting record:</p>
        <a href="${meetingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Review Meeting
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${meetingUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated notification from Comply Vault.</p>
      </div>
    `,
    text: `
      Your Meeting Draft is Ready for Review
      
      The transcription for your meeting with ${clientName} on ${meetingDate.toLocaleDateString()} is complete and ready for your review.
      
      Review the meeting: ${meetingUrl}
      
      This is an automated notification from Comply Vault.
    `,
  };

  // In development without Resend API key, log the email instead
  if (!resend) {
    console.log("📧 [DEV MODE] Draft ready email would be sent:");
    console.log("To:", email);
    console.log("Subject:", emailContent.subject);
    console.log("Meeting URL:", meetingUrl);
    return { success: true, id: "dev-mode" };
  }

  try {
    const result = await resend.emails.send(emailContent);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return { success: true, id: result.data?.id || "sent" };
  } catch (error) {
    console.error("Error sending draft ready email:", error);
    // Don't throw - email failures shouldn't block the workflow
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

