
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Razorpay from 'razorpay';

const orderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('CRITICAL: Razorpay environment variables are not set on the server.');
    return NextResponse.json({ error: 'Server configuration error: Missing Razorpay credentials.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const parsedBody = orderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 });
    }

    const { amount, currency } = parsedBody.data;
    
    const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    const options = {
      amount, // amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
        return NextResponse.json({ error: 'Failed to create Razorpay order.' }, { status: 500 });
    }

    return NextResponse.json(order, { status: 200 });
    
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred during payment processing.' }, { status: 500 });
  }
}
