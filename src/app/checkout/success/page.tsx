import { Suspense } from "react";
import SuccessContent from "@/components/checkout/success-content";

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="container flex min-h-[80vh] items-center justify-center"><p>Loading...</p></div>}>
            <SuccessContent />
        </Suspense>
    )
}
