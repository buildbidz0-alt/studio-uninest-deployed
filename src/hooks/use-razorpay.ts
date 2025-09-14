
'use client';

import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const { supabase } = useAuth();
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load Razorpay Checkout.',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const openCheckout = (options: any) => {
    if (!razorpayKey) {
       console.error("Razorpay Key ID is not defined. Please check your environment variables.");
       toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Payment gateway is not configured correctly.',
      });
      return;
    }
      
    if (!isLoaded || !supabase) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Payment gateway is not ready. Please try again in a moment.',
      });
      return;
    }

    // New logic: Override the handler to include the auth token
    const originalHandler = options.handler;
    options.handler = async (response: any) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to complete this payment. Please log in and try again.',
            });
            return;
        }

        const accessToken = session.access_token;
        
        // Pass the original response and the access token to the original handler
        // The calling component will be responsible for sending it to the API
        if (originalHandler) {
            originalHandler(response, accessToken);
        }
    };


    const rzp = new window.Razorpay({ ...options, key: razorpayKey });
    rzp.open();
  };

  return { openCheckout, isLoaded };
}
