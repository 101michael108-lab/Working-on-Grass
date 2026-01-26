"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import Link from "next/link"

export default function PayfastGuidePage() {

    const envLocalContent = `
# PayFast Credentials & Configuration
# IMPORTANT: This file should be named .env.local and placed in the root of your project.
# It MUST also be added to your .gitignore file to keep your secrets safe.

# --- PRODUCTION ---
# Replace with your LIVE PayFast Merchant ID (public).
# NEXT_PUBLIC_PAYFAST_MERCHANT_ID="YOUR_LIVE_MERCHANT_ID"
# Replace with your LIVE PayFast Passphrase (secret, for server-side use only).
# PAYFAST_PASSPHRASE="YOUR_LIVE_PASSPHRASE"

# --- SANDBOX (for testing) ---
# Uncomment these lines to use the sandbox environment.
NEXT_PUBLIC_PAYFAST_MERCHANT_ID="10000100"
PAYFAST_PASSPHRASE="jt7NOE43FZPn"

# The base URL of your application when deployed.
# This is crucial for return, cancel, and notify URLs.
# Example for production: https://your-domain.com
# Example for local testing with Firebase emulators: http://localhost:9002
NEXT_PUBLIC_SITE_URL="http://localhost:9002"

# URL for the PayFast processing endpoint.
# Use the sandbox URL for testing.
# Sandbox: https://sandbox.payfast.co.za/eng/process
# Live: https://www.payfast.co.za/eng/process
NEXT_PUBLIC_PAYFAST_PROCESS_URL="https://sandbox.payfast.co.za/eng/process"
`.trim();

  const formHtml = `
<form action="https://sandbox.payfast.co.za/eng/process" method="post">
  <input type="hidden" name="merchant_id" value={process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID}>
  <input type="hidden" name="merchant_key" value="YOUR_MERCHANT_KEY">
  <input type="hidden" name="return_url" value="https://your-site.com/checkout/success">
  <input type="hidden" name="cancel_url" value="https://your-site.com/checkout/cancel">
  <input type="hidden" name="notify_url" value="https://your-site.com/api/payfast-itn">
  
  <input type="hidden" name="name_first" value="First Name">
  <input type="hidden" name="name_last" value="Last Name">
  <input type="hidden" name="email_address" value="test@example.com">
  
  <input type="hidden" name="m_payment_id" value="ORDER_ID_12345">
  <input type="hidden" name="amount" value="100.00">
  <input type="hidden" name="item_name" value="Your Order #12345">
  
  <input type="hidden" name="signature" value="GENERATED_SIGNATURE_ON_SERVER">
  
  <button type="submit">Pay Now</button>
</form>
  `.trim();

  const itnPseudoCode = `
// src/app/api/payfast-itn/route.ts
// This is a Next.js API Route Handler - a server-side endpoint

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init'; // You would need a server-side Firebase admin init

export async function POST(req: NextRequest) {
  const pfData = await req.formData();
  const pfDataObj = Object.fromEntries(pfData.entries());
  
  // 1. Validate the data came from PayFast
  //    (Check their server IP addresses - see PayFast docs)
  
  // 2. Create a signature from the received data (excluding the signature field)
  //    This must be done on the server with your passphrase.
  const fields = {...pfDataObj};
  delete fields.signature;
  
  let checkString = '';
  for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
          checkString += \`\${key}=\${encodeURIComponent(fields[key]).replace(/%20/g, '+')}&\`;
      }
  }
  // IMPORTANT: The passphrase must be added at the end, and should not be URL encoded.
  checkString = checkString.slice(0, -1); // remove last '&'
  checkString += \`&passphrase=\${process.env.PAYFAST_PASSPHRASE}\`;

  const serverSignature = crypto.createHash('md5').update(checkString).digest('hex');

  // 3. Verify signatures match
  if (serverSignature !== pfDataObj.signature) {
    console.error("Signatures do not match");
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // 4. Verify the payment status in a separate call to PayFast
  //    This is the most reliable way to confirm payment.
  //    You'd make a POST request back to PayFast's validation endpoint.

  // 5. If everything checks out, update your database
  const orderId = pfDataObj.m_payment_id as string;
  const userId = pfDataObj.custom_str1 as string; // Assuming you pass userId in custom_str1
  
  if (!userId || !orderId) {
     return new NextResponse('Missing custom data', { status: 400 });
  }

  const orderRef = doc(firestore, 'users', userId, 'orders', orderId); 
  
  if (pfDataObj.payment_status === 'COMPLETE') {
    await updateDoc(orderRef, {
      status: 'Processing', // Or 'Fulfilled', 'Paid', etc.
      paymentInfo: pfDataObj, // Store the payment details
    });
  } else {
     await updateDoc(orderRef, {
      status: 'Cancelled', // Or failed, etc.
      paymentInfo: pfDataObj, 
    });
  }
  
  return new NextResponse('OK', { status: 200 });
}
  `.trim();

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">PayFast Integration Guide</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This is a high-level guide to integrating PayFast into your Next.js application. A full integration requires a backend to securely handle secret keys and process payment notifications.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Environment Variables</CardTitle>
            <CardDescription>
                Before you begin, ensure the file named <code>.env.local</code> in the root of your project contains your PayFast credentials. <strong>Never commit this file to version control.</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
                <p className="mb-2 text-sm">Copy the following into your <code>.env.local</code> file and replace the placeholders with your actual credentials from your PayFast dashboard when you are ready to go live.</p>
                <CodeBlock code={envLocalContent} language="bash" />
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 2: Backend Required</CardTitle>
            <CardDescription>
              You cannot complete a PayFast integration from the frontend alone. You need a secure, server-side environment for two critical tasks:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Generating a Secure Signature:</strong> PayFast requires a unique 'signature' to be sent with each payment request. This signature is an MD5 hash of the payment data combined with your secret PayFast Passphrase. This must be generated on a server to keep your passphrase safe.</li>
              <li><strong>Handling the Instant Transaction Notification (ITN):</strong> After a payment is made, PayFast sends a POST request (an ITN callback) to a URL you provide. Your backend must listen for this ITN, validate it, and then update the order status in your Firestore database.</li>
            </ul>
             <p className="mt-4 text-sm">The best way to implement this in Next.js is using <Link href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers" target="_blank" className="text-primary underline">API Route Handlers</Link>.</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Step 3: The Payment Form</CardTitle>
                <CardDescription>
                    On your checkout page, instead of just creating an order, you would generate the signature on the server and then render a form that POSTs directly to PayFast. Your app now does this automatically.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-2 text-sm">Here's a basic example of the HTML form. The `signature` field must be generated on your backend right before displaying this form.</p>
                <CodeBlock code={formHtml} language="html" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Step 4: Handling the ITN Callback</CardTitle>
                <CardDescription>
                    This is the most critical part. You need to create an API route (e.g., `/app/api/payfast-itn/route.ts`) that PayFast can call. This endpoint is responsible for verifying the payment and updating your database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-2 text-sm">Below is pseudo-code for what this API route might look like. It outlines the validation steps required.</p>
                <CodeBlock code={itnPseudoCode} language="typescript" />
                 <p className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-md"><strong>Important:</strong> You would need to set up the Firebase Admin SDK for server-side operations on Firestore, which is different from the client-side SDK you're using now.</p>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}
