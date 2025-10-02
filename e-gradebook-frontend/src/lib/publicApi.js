export const HOLIDAYS_COUNTRY = import.meta.env.VITE_HOLIDAYS_COUNTRY || 'RS';

export async function getPublicHolidays(year, country = HOLIDAYS_COUNTRY) {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
  );
  if (!res.ok) throw new Error('Failed to fetch holidays');
  return res.json();
}
