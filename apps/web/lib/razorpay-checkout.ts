export type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency?: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  /**
   * Pre-selects a payment method inside the Razorpay modal, e.g. "emi" opens
   * straight on the EMI tab instead of the default method list.
   *
   * Advisory only. Razorpay falls back to the standard list when the method is
   * not enabled on the account, or when the order fails that method's rules
   * (EMI has a minimum order value and is card/bank dependent). It never
   * changes the amount charged — that is fixed by the order.
   */
  preferredMethod?: "card" | "netbanking" | "wallet" | "upi" | "emi";
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
};

type RazorpayInstance = { open: () => void; on: (event: string, handler: () => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

function isUsableRazorpayKey(key: string): boolean {
  if (!key) return false;
  if (/placeholder|dummy|example|your[_-]?key/i.test(key)) return false;
  return key.startsWith("rzp_live_") || key.startsWith("rzp_test_");
}

/** Public key from env — empty until real KBC Razorpay keys are configured. */
export function getRazorpayKeyId(): string {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";
  return isUsableRazorpayKey(key) ? key : "";
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const keyId = options.keyId?.trim() ?? "";
  if (!isUsableRazorpayKey(keyId)) {
    throw new Error(
      "Razorpay is not configured for KBC Trip. Set NEXT_PUBLIC_RAZORPAY_KEY_ID to your KBC Razorpay key — do not use Unotrips or placeholder keys.",
    );
  }

  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");
  return new Promise((resolve, reject) => {
    let completed = false;
    const rzp = new window.Razorpay!({
      key: keyId,
      amount: options.amountPaise,
      currency: options.currency ?? "INR",
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: {
        ...options.prefill,
        ...(options.preferredMethod ? { method: options.preferredMethod } : {}),
      },
      theme: { color: "#0f766e" },
      async handler(response: RazorpaySuccessResponse) {
        completed = true;
        try {
          await options.onSuccess(response);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Payment verification failed."));
        }
      },
      modal: {
        ondismiss() {
          if (!completed) {
            options.onDismiss?.();
            reject(new Error("Payment cancelled."));
          }
        },
      },
    });
    rzp.on("payment.failed", () => reject(new Error("Payment failed. Please try again.")));
    rzp.open();
  });
}
