/**
 * Maps country names and common variants to ISO 3166-1 alpha-2 codes.
 * Used to shorten address display (e.g. "United States" -> "US").
 */
const COUNTRY_TO_CODE: Record<string, string> = {
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'u.s.': 'US',
  'u.s.a.': 'US',
  'united kingdom': 'GB',
  'great britain': 'GB',
  'u.k.': 'GB',
  uk: 'GB',
  england: 'GB',
  canada: 'CA',
  australia: 'AU',
  france: 'FR',
  germany: 'DE',
  italy: 'IT',
  spain: 'ES',
  japan: 'JP',
  china: 'CN',
  mexico: 'MX',
  brazil: 'BR',
  india: 'IN',
  netherlands: 'NL',
  belgium: 'BE',
  switzerland: 'CH',
  austria: 'AT',
  portugal: 'PT',
  ireland: 'IE',
  sweden: 'SE',
  norway: 'NO',
  denmark: 'DK',
  finland: 'FI',
  poland: 'PL',
  greece: 'GR',
  russia: 'RU',
  'south korea': 'KR',
  'south africa': 'ZA',
  argentina: 'AR',
  chile: 'CL',
  colombia: 'CO',
  peru: 'PE',
  'new zealand': 'NZ',
  singapore: 'SG',
  'hong kong': 'HK',
  thailand: 'TH',
  vietnam: 'VN',
  indonesia: 'ID',
  malaysia: 'MY',
  philippines: 'PH',
  'united arab emirates': 'AE',
  uae: 'AE',
  'saudi arabia': 'SA',
  israel: 'IL',
  turkey: 'TR',
  egypt: 'EG',
  morocco: 'MA',
  iceland: 'IS',
  luxembourg: 'LU',
  'czech republic': 'CZ',
  hungary: 'HU',
  romania: 'RO',
  croatia: 'HR',
  slovenia: 'SI',
  slovakia: 'SK',
  bulgaria: 'BG',
  ukraine: 'UA',
  estonia: 'EE',
  latvia: 'LV',
  lithuania: 'LT',
  malta: 'MT',
  cyprus: 'CY',
};

/**
 * Shortens country names in an address string to ISO country codes for display.
 * e.g. "123 Main St, New York, NY, United States" -> "123 Main St, New York, NY, US"
 */
export function shortenCountryInAddress(address: string): string {
  if (!address?.trim()) return address;

  const parts = address.split(',').map((p) => p.trim());
  if (parts.length < 2) return address;

  const lastPart = parts[parts.length - 1].toLowerCase();
  const code = COUNTRY_TO_CODE[lastPart];

  if (code) {
    parts[parts.length - 1] = code;
    return parts.join(', ');
  }

  // Already a 2-letter code (e.g. "US", "FR")
  if (lastPart.length === 2 && /^[A-Za-z]{2}$/.test(lastPart)) {
    return address;
  }

  return address;
}
