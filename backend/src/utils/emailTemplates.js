export const newsletterTemplate = () => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2e2e2e; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; letter-spacing: 2px; font-size: 24px;">
          HAIR LANGUAGE
        </h1>
      </div>

      <div style="padding: 40px 30px; line-height: 1.6; color: #333;">
        <h2 style="font-size: 18px; margin-bottom: 20px;">Welcome aboard!</h2>
        <p style="margin-bottom: 25px;">
          Thank you for subscribing to Hair Language. You'll be the first to
          know about our new arrivals, wig care tips, and exclusive offers.
        </p>

        <div style="margin-top: 40px; border-top: 1px solid #e6e6e6; padding-top: 20px;">
          <p style="font-size: 14px; color: #7a7a7a; margin: 0;">
            Stay beautiful,
          </p>
          <p style="font-weight: bold; margin: 5px 0 0 0;">Franscisca</p>
          <p style="font-size: 12px; color: #6b6b6b;">Founder, Hair Language</p>
        </div>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #bbb; margin: 0;">
          &copy; ${currentYear} Hair Language | A brand you can trust.
        </p>
      </div>
    </div>
  `;
};

export const contactMsgTemplate = (name, subject, message) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #2e2e2e; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">
          Hair Language
        </h1>
      </div>

      <div style="padding: 40px 30px; line-height: 1.6; color: #333;">
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 20px; color: #1a1a1a;">Hi ${name},</h3>
        
        <p style="margin-bottom: 15px;">
          Thanks for reaching out! We've received your inquiry regarding 
          <strong style="color: #1a1a1a;">"${subject || "General Inquiry"}"</strong>.
        </p>
        
        <p style="margin-bottom: 20px;">
          Our team typically responds within 24 hours. For your records, here is a copy of your message:
        </p>

        <div style="background-color: #f9f9f9; border-left: 4px solid #2e2e2e; padding: 20px; margin: 25px 0; font-style: italic; color: #555; border-radius: 0 4px 4px 0;">
          "${message}"
        </div> 

        <div style="margin-top: 40px; border-top: 1px solid #e6e6e6; padding-top: 20px;">
          <p style="font-size: 14px; color: #7a7a7a; margin: 0;">Best regards,</p>
          <p style="font-weight: bold; margin: 5px 0 0 0; color: #1a1a1a;">The Hair Language Team</p>
          <p style="font-size: 12px; color: #6b6b6b; margin-top: 2px;">A brand you can trust</p>
        </div>
      </div>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #999; margin: 0;">
          This is an automated confirmation of your inquiry.
        </p>
      </div>
    </div>
  `;
};

export const adminContactAlert = (name, email, subject, message) => {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #2e2e2e; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
          📩 New Website Message
        </h2>
      </div>

      <div style="padding: 30px;">
        <div style="background-color: #f8fafd; border: 1px solid #e1e8f0; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 13px; color: #5c6a7a; font-weight: bold; text-transform: uppercase;">Inquiry Details</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #999; width: 80px;">FROM</td>
              <td style="padding: 5px 0; font-size: 15px; color: #1a1a1a; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #999;">EMAIL</td>
              <td style="padding: 5px 0; font-size: 15px; color: #1a1a1a;">
                <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 12px; color: #999;">SUBJECT</td>
              <td style="padding: 5px 0; font-size: 15px; color: #1a1a1a;">${subject || "General Inquiry"}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <strong style="display: block; font-size: 14px; color: #1a1a1a; margin-bottom: 10px;">Message:</strong>
          <div style="font-size: 15px; color: #333; line-height: 1.6; padding: 20px; background-color: #ffffff; border: 1px solid #eee; border-radius: 4px; border-top: 3px solid #2e2e2e;">
            ${message}
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
            You can reply directly to this email to contact <strong>${name}</strong>.
          </p>
          <a href="${process.env.ADMIN_URL || "#"}" 
             style="display: inline-block; padding: 12px 20px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px;">
             OPEN ADMIN PANEL
          </a>
        </div>
      </div>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #999; margin: 0;">
          Hair Language Official Support • ${currentYear}
        </p>
      </div>
    </div>
  `;
};

export const consultationTemplate = (name) => {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #2e2e2e; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">
          Hair Language
        </h1>
      </div>

      <div style="padding: 40px 30px; line-height: 1.6; color: #333;">
        <h2 style="font-size: 20px; color: #1a1a1a; margin-top: 0;">Hello ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for choosing <strong style="color: #1a1a1a;">Hair Language</strong> for your hair journey!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          We have successfully received your <strong>consultation request</strong>. Our team is currently reviewing your details, and we will get back to you shortly to discuss your needs and next steps.
        </p>

        <div style="background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 4px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            In the meantime, feel free to browse our latest collection or save any inspiration photos you'd like to share with us!
          </p>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #e6e6e6; padding-top: 20px;">
          <p style="font-size: 14px; color: #7a7a7a; margin: 0;">Best regards,</p>
          <p style="font-weight: bold; margin: 5px 0 0 0; color: #1a1a1a;">Franscisca</p>
          <p style="font-size: 12px; color: #6b6b6b; margin-top: 2px;">Founder, Hair Language</p>
        </div>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #bbb; margin: 0;">
          &copy; ${currentYear} Hair Language | A brand you can trust.
        </p>
      </div>
    </div>
  `;
};

export const adminConsultationAlert = (name, contact, message) => {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
          🚨 New Consultation Request
        </h2>
      </div>

      <div style="padding: 30px;">
        <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Customer Details</p>
          
          <div style="margin-bottom: 15px;">
            <strong style="display: block; font-size: 12px; color: #999;">NAME</strong>
            <span style="font-size: 18px; color: #1a1a1a; font-weight: bold;">${name}</span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="display: block; font-size: 12px; color: #999;">CONTACT</strong>
            <span style="font-size: 16px; color: #1a1a1a;">${contact}</span>
          </div>

          <div>
            <strong style="display: block; font-size: 12px; color: #999;">STATUS</strong>
            <span style="display: inline-block; background-color: #eeb400; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDING</span>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <strong style="display: block; font-size: 14px; color: #1a1a1a; margin-bottom: 10px;">Message:</strong>
          <div style="font-size: 15px; color: #444; line-height: 1.6; padding: 15px; background-color: #fff; border: 1px solid #eee; border-radius: 4px; border-left: 4px solid #1a1a1a;">
            ${message || "No message provided."}
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.ADMIN_URL || "#"}" 
             style="background-color: #1a1a1a; color: #ffffff; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">
             VIEW IN ADMIN DASHBOARD
          </a>
        </div>
      </div>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #999; margin: 0;">
          Sent via Hair Language Backend • ${currentYear}
        </p>
      </div>
    </div>
  `;
};

export const otpTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-size: 24px;">Hair Language</h1>
        </div>

        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Verify Your Email</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #666;">Hello ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 30px;">
            Thank you for joining Hair Language. Use the code below to complete your registration. This code will expire in 10 minutes.
          </p>
          
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 4px; display: inline-block; letter-spacing: 5px; font-size: 32px; font-weight: bold; color: #1a1a1a; border: 1px dashed #ccc;">
            ${otp}
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #aaa; margin: 0;">
            &copy; 2026 Hair Language. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `;
};
