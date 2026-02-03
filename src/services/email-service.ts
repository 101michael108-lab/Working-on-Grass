
/**
 * @fileOverview A server-side utility for sending order-related emails.
 * In a production environment, this would interface with a provider like Resend, SendGrid, or Mailgun.
 */

interface OrderConfirmationPayload {
  to: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload) {
  console.log(`[Email Service] Preparing order confirmation for ${payload.to} (Order #${payload.orderId})`);
  
  // NOTE: To make this functional, you would use a package like 'resend' or 'nodemailer'.
  // Example with Resend (Placeholder):
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Working on Grass <orders@workingongrass.co.za>',
    to: payload.to,
    subject: `Order Confirmation #${payload.orderId.substring(0, 8)}`,
    html: `<h1>Thank you for your order, ${payload.customerName}!</h1>...`
  });
  */

  // Mocking a successful send for now
  return { success: true, message: "Email queued (Mock)" };
}

export async function sendAdminOrderNotification(payload: OrderConfirmationPayload) {
  console.log(`[Email Service] Notifying Admin of new paid order: #${payload.orderId}`);
}
