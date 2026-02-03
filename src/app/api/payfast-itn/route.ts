import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const { firestore } = initializeFirebase();
    
    let pfData: Record<string, FormDataEntryValue> = {};
    let checkString = '';

    // Build the parameter string and data object, preserving order from form data
    // This is important for signature validation.
    for (const [key, value] of body.entries()) {
        pfData[key] = value;
        if (key !== 'signature') {
            checkString += `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}&`;
        }
    }
    
    // Remove last ampersand
    checkString = checkString.slice(0, -1);

    // Append passphrase from environment variables
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    if (passphrase) {
        checkString += `&passphrase=${passphrase}`;
    }
    
    const calculatedSignature = crypto.createHash('md5').update(checkString).digest('hex');
    const receivedSignature = pfData.signature as string;

    if (calculatedSignature !== receivedSignature) {
        console.warn("PayFast ITN: Signatures do not match.", { calculated: calculatedSignature, received: receivedSignature });
        return new NextResponse('Invalid signature', { status: 400 });
    }

    // Validation successful, update database
    const orderId = pfData.m_payment_id as string;
    const userId = pfData.custom_str1 as string;
    const paymentStatus = pfData.payment_status as string;

    if (!userId || !orderId) {
       console.error("PayFast ITN: Missing userId or orderId in callback data.");
       return new NextResponse('Missing custom data', { status: 400 });
    }

    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    
    // Determine new order status based on payment status
    const newStatus = paymentStatus === 'COMPLETE' ? 'Processing' : 'Cancelled';

    await updateDoc(orderRef, {
      status: newStatus,
      paymentInfo: {
        ...pfData, // Store the full ITN payload for reference
        itn_validated_at: new Date().toISOString(),
      },
    });

    console.log(`PayFast ITN: Order ${orderId} for user ${userId} updated to ${newStatus}.`);
    
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error("Error in PayFast ITN handler:", error.message || error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
