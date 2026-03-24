export interface ProviderScanRecord {
  id: string;
  providerId: string;
  providerName: string;
  providerType: string;
  scannedAt: string;
  rawPayload: string;
  touristId?: string;
  touristEmail?: string;
  touristRole?: string;
}

const STORAGE_KEY = 'tripkey_provider_scan_history';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getAllRecords(): ProviderScanRecord[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProviderScanRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllRecords(records: ProviderScanRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addProviderScanRecord(record: ProviderScanRecord) {
  const current = getAllRecords();
  const next = [record, ...current].slice(0, 500);
  saveAllRecords(next);
}

export function getProviderScanHistory(providerId: string): ProviderScanRecord[] {
  return getAllRecords().filter((item) => item.providerId === providerId);
}

export function clearProviderScanHistory(providerId: string) {
  const next = getAllRecords().filter((item) => item.providerId !== providerId);
  saveAllRecords(next);
}

export function extractTouristTokenFromQrUrl(rawPayload: string): string | undefined {
  try {
    const url = new URL(rawPayload);
    return (
      url.searchParams.get('touristToken') ||
      url.searchParams.get('tourist') ||
      url.searchParams.get('token') ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export function tryParseTripKeyPayload(rawPayload: string): {
  touristId?: string;
  touristEmail?: string;
  touristRole?: string;
} {
  const tokenFromUrl = extractTouristTokenFromQrUrl(rawPayload);

  if (tokenFromUrl) {
    try {
      const url = new URL(rawPayload);
      return {
        touristId: tokenFromUrl,
        touristEmail: url.searchParams.get('email') || undefined,
        touristRole: url.searchParams.get('role') || undefined,
      };
    } catch {
      return { touristId: tokenFromUrl };
    }
  }

  try {
    const parsed = JSON.parse(rawPayload) as {
      tripkey_user_id?: string;
      email?: string;
      role?: string;
    };

    return {
      touristId: parsed.tripkey_user_id,
      touristEmail: parsed.email,
      touristRole: parsed.role,
    };
  } catch {
    return {};
  }
}
