import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest('hex');

    const isValid = generated === razorpay_signature;
    return NextResponse.json({ success: isValid });
  } catch (err) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
