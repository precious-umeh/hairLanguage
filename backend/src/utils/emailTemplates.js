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

export const otpTemplate = (name, otp, type = "registration") => {
  const currentYear = new Date().getFullYear();

  // Define content based on type
  const isReset = type === "reset";

  const title = isReset ? "Reset Your Password" : "Verify Your Email";
  const bodyText = isReset
    ? "We received a request to reset your password. Use the code below to proceed with the reset. This code will expire in 10 minutes."
    : "Thank you for joining Hair Language. Use the code below to complete your registration. This code will expire in 10 minutes.";

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-size: 24px;">Hair Language</h1>
        </div>

        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">${title}</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #666;">Hello ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 30px;">
            ${bodyText}
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
            &copy; ${currentYear} Hair Language. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `;
};

export const orderReceivedTemplate = (order, isAdmin = false) => {
  const currentYear = new Date().getFullYear();

  // Calculate the item subtotal dynamically so we don't rely on frontend matching discrepancies
  const calculatedSubtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Explicitly fetch tax and delivery fees from your schema, defaulting to 0 if not present
  const taxFee = order.taxFee || 0;
  const deliveryFee = order.deliveryFee || 0;

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold; color: #1a1a1a;">${item.productName}</div>
        <div style="font-size: 12px; color: #666;">Qty: ${item.quantity} ${item.size ? `| Size: ${item.size}''` : ""}</div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #1a1a1a;">
        ₦${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `,
    )
    .join("");

  // Dynamic content variables based on who is receiving the copy
  const headlineText = isAdmin ? "New Order Alert!" : "Order Received!";
  const introMessage = isAdmin
    ? `An order has been registered on the platform from <strong>${order.email || "Guest Client"}</strong> and is currently awaiting transaction verification.`
    : "Thank you for your order. We have received it and it's currently <strong>pending payment</strong>.";

  const trackingLabel = isAdmin ? "ORDER REFERENCE ID" : "YOUR TRACKING ID";

  const actionButtonUrl = isAdmin
    ? `${process.env.FRONTEND_URL}/admin/orders`
    : `${process.env.FRONTEND_URL}/pages/track-order`;

  const actionButtonText = isAdmin ? "VIEW DASHBOARD" : "TRACK YOUR ORDER";

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">Hair Language</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 20px; color: #1a1a1a; margin-top: 0; text-align: center;">${headlineText}</h2>
        <p style="text-align: center; color: #666;">${introMessage}</p>
        
        <div style="margin: 30px 0; padding: 20px; border: 1px dashed #ccc; background-color: #f9f9f9; text-align: center;">
          <span style="display: block; font-size: 12px; color: #999; margin-bottom: 5px;">${trackingLabel}</span>
          <strong style="font-size: 18px; color: #1a1a1a; letter-spacing: 1px;">${order._id}</strong>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; font-size: 12px; color: #999; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">ITEM</th>
              <th style="text-align: right; font-size: 12px; color: #999; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">PRICE</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="width: 100%; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #666; width: 75%;">Subtotal:</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #1a1a1a; font-weight: 500;">₦${calculatedSubtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #666;">VAT / Tax:</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #1a1a1a; font-weight: 500;">₦${taxFee.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #666; padding-bottom: 10px;">Delivery Fee:</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #1a1a1a; font-weight: 500; padding-bottom: 10px;">₦${deliveryFee.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 2px solid #1a1a1a;">
              <td style="padding: 15px 0 0 0; text-align: right; font-size: 15px; font-weight: bold; color: #666;">Total Amount:</td>
              <td style="padding: 15px 0 0 0; text-align: right; font-size: 24px; font-weight: bold; color: #1a1a1a;">₦${order.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="${actionButtonUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">${actionButtonText}</a>
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #999; margin: 0;">&copy; ${currentYear} Hair Language Official Store</p>
      </div>
    </div>
  `;
};

export const paymentSuccessTemplate = (orderId, amount, isAdmin = false) => {
  // Dynamic messaging depending on recipient
  const titleText = isAdmin ? "Payment Captured" : "Payment Confirmed";

  const descriptionHtml = isAdmin
    ? `A payment of <strong>₦${amount.toLocaleString()}</strong> has been successfully captured and settled via Paystack for Order <strong>#${orderId}</strong>.`
    : `We've successfully processed your payment of <strong>₦${amount.toLocaleString()}</strong> for Order <strong>#${orderId}</strong>.`;

  const callToActionHtml = isAdmin
    ? `<p style="color: #666; margin-bottom: 30px;">Log in to your dashboard to view fulfillment parameters and print shipping labels.</p>`
    : `<p style="color: #666; margin-bottom: 30px;">Our team is now preparing your order for delivery!</p>`;

  const signOffHtml = isAdmin
    ? `
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 12px; color: #7a7a7a; margin: 0;">Automated Store Ledger Registry</p>
          <p style="font-weight: bold; margin: 5px 0 0 0; color: #1a1a1a;">Hair Language System</p>
        </div>
      `
    : `
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 14px; color: #7a7a7a; margin: 0;">Stay beautiful,</p>
          <p style="font-weight: bold; margin: 5px 0 0 0; color: #1a1a1a;">Franscisca</p>
        </div>
      `;

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #2e2e2e; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">Hair Language</h1>
      </div>
      <div style="padding: 40px 30px; text-align: center;">
        <div style="width: 80px; height: 80px; background-color: #f0fff4; border-radius: 50%; margin: 0 auto 20px auto; display: block;">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" 
            alt="Success" 
            style="width: 40px; height: 40px; margin-top: 20px;"
          />
        </div>

        <h2 style="font-size: 22px; color: #1a1a1a; margin-top: 0;">${titleText}</h2>
        <p style="color: #666; line-height: 1.6;">${descriptionHtml}</p>
        ${callToActionHtml}
        
        ${signOffHtml}
      </div>
    </div>
  `;
};

export const adminNewSignupTemplate = (user) => {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">Hair Language</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 20px; color: #1a1a1a; margin-top: 0; text-align: center;">New Patron Registered!</h2>
        <p style="text-align: center; color: #666; line-height: 1.6;">A customer has successfully verified their identity via OTP and established an active account profile on your store platform.</p>
        
        <div style="margin: 30px 0; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666; width: 30%;"><strong>Full Name:</strong></td>
              <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${user.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666;"><strong>Email Address:</strong></td>
              <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666;"><strong>Account Status:</strong></td>
              <td style="padding: 6px 0; font-size: 13px; color: #2f855a; font-weight: bold; text-transform: uppercase;">Verified ✓</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 35px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/admin" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">OPEN MANAGEMENT CORE</a>
        </div>
        
        <p style="font-size: 11px; color: #999; margin-top: 35px; text-align: center; line-height: 1.4;">
          This is an automated administrative system alert.<br/>
          You can toggle or refine customer signup notification streams inside your admin settings dashboard workspace panel.
        </p>
      </div>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #999; margin: 0;">&copy; ${currentYear} Hair Language Official Store</p>
      </div>
    </div>
  `;
};

export const adminInventoryAlertTemplate = (
  productName,
  size,
  remainingStock,
  type,
) => {
  const currentYear = new Date().getFullYear();
  const isOutOfStock = type === "outOfStock";

  const alertTitle = isOutOfStock
    ? "🚨 Out of Stock Alert"
    : "⚠️ Low Stock Warning";
  const badgeColor = isOutOfStock ? "#dc2626" : "#d97706";
  const statusText = isOutOfStock
    ? "Completely Sold Out (0 units left)"
    : `Only ${remainingStock} unit(s) remaining!`;
  const actionMessage = isOutOfStock
    ? "This variant has been completely depleted. Customers can no longer purchase this specific size until inventory is replenished."
    : "This variant has dropped below your safety threshold. Consider restocking soon to avoid stockouts.";

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px; text-transform: uppercase;">Hair Language</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 20px; color: ${badgeColor}; margin-top: 0; text-align: center;">${alertTitle}</h2>
        <p style="text-align: center; color: #666; line-height: 1.6;">Your system has detected a critical shift in inventory levels during processing.</p>
        
        <div style="margin: 30px 0; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666; width: 35%;"><strong>Product Name:</strong></td>
              <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a; font-weight: bold;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666;"><strong>Variant Size:</strong></td>
              <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${size ? `${size} inches` : "Standard"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #666;"><strong>Current Stock:</strong></td>
              <td style="padding: 6px 0; font-size: 14px; color: ${badgeColor}; font-weight: bold;">${statusText}</td>
            </tr>
          </table>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 30px;">${actionMessage}</p>

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/admin/products" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">MANAGE INVENTORY</a>
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
        <p style="font-size: 11px; color: #999; margin: 0;">&copy; ${currentYear} Hair Language Official Store</p>
      </div>
    </div>
  `;
};
