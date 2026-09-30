import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "ta"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale = defaultLocale;

  try {
    const reqLocale = await requestLocale;
    if (reqLocale && locales.includes(reqLocale as Locale)) {
      locale = reqLocale as Locale;
    } else {
      const cookieStore = cookies();
      const localeCookie = cookieStore.get("locale")?.value;
      if (localeCookie && locales.includes(localeCookie as Locale)) {
        locale = localeCookie as Locale;
      }
    }
  } catch {
    // Fallback if called outside a request scope (e.g. static generation or prerender)
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
