import crypto from 'crypto';

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

/** Build PayFast MD5 signature from field map (Object insertion order). */
export function generatePayfastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  return crypto
    .createHash('md5')
    .update(buildSignatureString(Object.entries(data), passphrase))
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
