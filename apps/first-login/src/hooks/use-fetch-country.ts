import { getTimezone as getTime } from '@metanodejs/system-core'
import { getTimezone } from 'countries-and-timezones'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
export const PHONE_COUNTRY_QUERY_KEY = ['phone-country']
export async function detectPhoneCountry(): Promise<string> {
  const time: any = await getTime()
  const timezone = time.timeZone
  const tz = getTimezone(timezone)
  if (!tz || !tz.countries?.length) {
    throw new Error('Cannot detect country from timezone')
  }

  return tz.countries[0] // ví dụ: 'VN'
}

export function createPhoneCountryQueryOptions(): UseQueryOptions<
  string,
  Error,
  string,
  typeof PHONE_COUNTRY_QUERY_KEY
> {
  return {
    queryKey: PHONE_COUNTRY_QUERY_KEY,
    queryFn: detectPhoneCountry,
    staleTime: Infinity,
    gcTime: Infinity
  }
}

export function usePhoneCountry() {
  return useQuery(createPhoneCountryQueryOptions())
}
