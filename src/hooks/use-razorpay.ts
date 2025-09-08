
'use client';

import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

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
    if (!isLoaded) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Razorpay is not loaded yet. Please try again in a moment.',
      });
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { openCheckout, isLoaded };
}
