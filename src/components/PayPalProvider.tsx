import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface PayPalProviderProps {
  children: ReactNode;
}

// PayPal Client ID para sandbox - Reemplaza con tu Client ID real de PayPal
// Para obtener tu Client ID: https://developer.paypal.com/developer/applications/
const PAYPAL_CLIENT_ID = "AeqErmNZBJ9EReW-JuxJl8vrns0eb0m61N67dCvFOoj907uMABui6EuNycuu21LmcRh_hF_nsWYvpSVF"; // PayPal sandbox Client ID

export function PayPalProvider({ children }: PayPalProviderProps) {
  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    locale: "es_ES",
    components: "buttons,funding-eligibility",
    "enable-funding": "card"
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
