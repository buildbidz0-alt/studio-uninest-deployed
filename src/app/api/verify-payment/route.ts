
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'edge';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        orderId,
        razorpay_payment_id,
        razorpay_signature,
        type, // 'donation' or 'competition_entry'
        userId,
        amount,
        competitionId,
    } = body;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        return NextResponse.json({ error: 'Razorpay secret not configured.' }, { status: 500 });
    }

    // 1. Verify Razorpay Signature
    const shasum = crypto.createHmac('sha256', keySecret);
    shasum.update(`${orderId}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    }

    // 2. Signature is valid, now save the record using admin client
    try {
        const supabaseAdmin = getSupabaseAdmin();
        
        if (type === 'donation') {
            const { error } = await supabaseAdmin.from('donations').insert({
                user_id: userId,
                amount: amount,
                currency: 'INR',
                razorpay_payment_id: razorpay_payment_id,
            });
            if (error) throw error;

        } else if (type === 'competition_entry') {
            const { error } = await supabaseAdmin.from('competition_entries').insert({
                competition_id: competitionId,
                user_id: userId,
                razorpay_payment_id: razorpay_payment_id,
            });
            if (error) throw error;
            
        } else {
            return NextResponse.json({ error: 'Invalid transaction type.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Payment record saved successfully.' });

    } catch (error: any) {
        console.error('Error saving payment record:', error);
        return NextResponse.json({ error: `Failed to save payment record: ${error.message}` }, { status: 500 });
    }
}
