import { Check } from "lucide-react";

/**
 * Shown in place of an enquiry form once it has been submitted, so the visitor
 * gets a confirmation that stays put (not a toast that vanishes in seconds).
 */
export function FormSent({ title, children, onReset }: { title: string; children: React.ReactNode; onReset: () => void }) {
  return (
    <div role="status" className="py-2">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-stock-border bg-stock-bg">
        <Check className="h-5 w-5 text-[#2E7D46]" strokeWidth={2} />
      </div>
      <h3 className="m-0 mb-2 font-headline text-[20px] font-semibold text-ink">{title}</h3>
      <p className="m-0 mb-5 text-[14px] leading-[1.65] text-body-soft">{children}</p>
      <button type="button" onClick={onReset} className="text-[13.5px] font-semibold text-forest underline-offset-2 hover:underline">
        Send another
      </button>
    </div>
  );
}
