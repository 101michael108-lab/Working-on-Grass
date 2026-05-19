import crypto from 'crypto';

/** PayFast custom integration field order (see PayFast docs). */
const PAYFAST_SIGN_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'payment_method',
] as const;

/** Replicates PHP urlencode() used by PayFast signature generation. */
export function phpUrlencode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E');
}

/** Order fields per PayFast docs; unknown keys appended alphabetically. */
export function orderPayfastFields(data: Record<string, string>): Array<[string, string]> {
  const used = new Set<string>();
  const entries: Array<[string, string]> = [];

  for (const key of PAYFAST_SIGN_FIELD_ORDER) {
    if (key in data && data[key].trim() !== '') {
      entries.push([key, data[key]]);
      used.add(key);
    }
  }

  const extras = Object.keys(data)
    .filter((k) => !used.has(k) && k !== 'signature' && data[k].trim() !== '')
    .sort();

  for (const key of extras) {
    entries.push([key, data[key]]);
  }

  return entries;
}

function buildSignatureString(
  entries: Array<[string, string]>,
  passphrase?: string
): string {
  const checkString = entries
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlencode(v.trim())}`)
    .join('&');

  return passphrase
    ? `${checkString}&passphrase=${phpUrlencode(passphrase.trim())}`
    : checkString;
}

/** Build PayFast MD5 signature from field map (PayFast field order). */
export function generatePayfastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  return crypto
    .createHash('md5')
    .update(buildSignatureString(orderPayfastFields(data), passphrase))
    .digest('hex');
}

/** ITN/webhook signatures must use the same field order as the POST body. */
export function generatePayfastSignatureFromEntries(
  entries: Array<[string, string]>,
  passphrase?: string
): string {
  const signEntries = entries.filter(([k]) => k !== 'signature');
  return crypto
    .createHash('md5')
    .update(buildSignatureString(signEntries, passphrase))
    .digest('hex');
}
