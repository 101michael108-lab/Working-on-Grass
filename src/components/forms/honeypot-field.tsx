/**
 * Spam trap for the public enquiry forms. Positioned off-screen and hidden from
 * assistive tech, so people never see or fill it; bots that fill every input do,
 * and /api/inquiry silently drops those submissions.
 */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}
