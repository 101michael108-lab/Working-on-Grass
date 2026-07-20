import { firebaseConfig } from '@/firebase/config';

/**
 * Minimal server-side reader for publicly-readable Firestore collections.
 *
 * Exists so server components can put real data into the SSR HTML instead of
 * shipping a skeleton and letting the client Firestore SDK fill it in after
 * hydration. Uses the REST API rather than firebase-admin because:
 *   - the collections read here are `allow read: if true` (see firestore.rules),
 *     so no credentials are needed and it works identically in every environment;
 *   - `fetch` participates in Next's data cache, so repeated renders are free.
 *
 * Only for public data. Anything requiring auth must go through firebase-admin.
 */

const BASE =
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
  `/databases/(default)/documents`;

/** A Firestore REST `Value`. Recursive — maps and arrays nest. */
type RestValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: RestValue[] };
  mapValue?: { fields?: Record<string, RestValue> };
};

type RestDocument = { name?: string; fields?: Record<string, RestValue> };

function decodeValue(value: RestValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  // Firestore returns 64-bit ints as strings; Number is right for prices/stock.
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  if (value.mapValue !== undefined) return decodeFields(value.mapValue.fields);
  return undefined;
}

function decodeFields(fields: Record<string, RestValue> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    const decoded = decodeValue(value);
    if (decoded !== undefined) out[key] = decoded;
  }
  return out;
}

export type ListOptions = {
  pageSize?: number;
  /** Firestore field path to order by, e.g. `'name'` or `'name desc'`. */
  orderBy?: string;
  /** Seconds before Next revalidates the cached response. */
  revalidate?: number;
  /** Cache tag, so a webhook or admin action can revalidate on demand. */
  tag?: string;
};

/**
 * Reads a public collection. Returns `[]` rather than throwing: every caller has
 * a client-side fallback, so a failed read should degrade to the old behaviour
 * (content appears after hydration), never blank the page or 500 the route.
 */
export async function listPublicCollection<T>(
  collection: string,
  { pageSize = 100, orderBy, revalidate = 300, tag }: ListOptions = {}
): Promise<T[]> {
  const params = new URLSearchParams({
    key: firebaseConfig.apiKey,
    pageSize: String(pageSize),
  });
  if (orderBy) params.set('orderBy', orderBy);

  try {
    const res = await fetch(`${BASE}/${collection}?${params}`, {
      next: { revalidate, ...(tag ? { tags: [tag] } : {}) },
    });
    if (!res.ok) {
      console.warn(`listPublicCollection(${collection}): Firestore REST responded ${res.status}`);
      return [];
    }

    const body = (await res.json()) as { documents?: RestDocument[] };
    return (body.documents ?? []).flatMap((doc) => {
      const id = doc.name?.split('/').pop();
      if (!id) return [];
      return [{ id, ...decodeFields(doc.fields) } as T];
    });
  } catch (error) {
    console.warn(`listPublicCollection(${collection}): read failed, falling back to client.`, error);
    return [];
  }
}
