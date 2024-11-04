import { ChakraProps, Link, LinkProps } from "@chakra-ui/react";
import NextLink from "next/link";
import crypto from "crypto";
import { Where } from "payload/types";

export const convertFrenchDateToEnglish = (
  frenchDate: string
): string | null => {
  const match = frenchDate.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);

  if (match) {
    const [, day, month, year] = match.map(Number);

    if (year !== undefined && month !== undefined && day !== undefined) {
      // Creating a Date object with a four-digit year
      const englishFormattedDate = new Date(2000 + year, month - 1, day);

      // Using toISOString to get the date in ISO format (YYYY-MM-DD)
      return englishFormattedDate.toISOString().split("T")[0] || null;
    }
  }

  // Return null if the input format is incorrect
  return null;
};

export const frenchPhoneNumber = /^(?:\+33[1-9](\d{8})|(?!.*\+\d{2}).{10})$/;

export const payloadOrPhoneNumberCheck = (phone_number: string): Where => {
  const hasDialingCode = phone_number.startsWith("+");

  return {
    or: [
      {
        phone_number: {
          equals: hasDialingCode
            ? phone_number
            : `+33${phone_number.substring(1)}`,
        },
      },
      {
        phone_number: {
          equals: hasDialingCode
            ? `0${phone_number.substring(3)}`
            : phone_number,
        },
      },
    ],
  };
};

export const payloadWhereOfferIsValid = (prefix?: string): Where => {
  const nowDate = new Date().toISOString().split("T")[0] as string;
  let finalPrefix = prefix ? `${prefix}.` : "";

  return {
    and: [
      {
        source: { equals: "cje" },
      },
      {
        [`${finalPrefix}validityTo`]: {
          greater_than_equal: `${nowDate}T00:00:00.000`,
        },
      },
      {
        or: [
          {
            [`${finalPrefix}validityFrom`]: {
              exists: false,
            },
          },
          {
            [`${finalPrefix}validityFrom`]: {
              less_than_equal: `${nowDate}T23:59:59.000`,
            },
          },
        ],
      },
    ],
  };
};

export const generateRandomCode = (): string => {
  const min = 1000;
  const max = 9999;
  const randomCode = Math.floor(Math.random() * (max - min + 1) + min);
  return randomCode.toString();
};

export const generateRandomPassword = (length: number): string => {
  const buffer = crypto.randomBytes(length);
  const password = buffer
    .toString("base64")
    .replace(/[/+=]/g, "")
    .slice(0, length);

  return password;
};

export const addSpaceToTwoCharacters = (input: string) => {
  var result = input.replace(/(\d{2})/g, "$1 ");

  result = result.trim();

  return result;
};

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_URL_APP) return process.env.NEXT_PUBLIC_URL_APP;
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  return !!navigator.userAgent.match(/(iPod|iPhone|iPad)/);
};

export const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      window.navigator.standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};

export const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isNbOfDaysToEndOfTheMonth = (nbOfDays: number) => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const targetDate = new Date(lastDayOfMonth);
  targetDate.setDate(targetDate.getDate() - (nbOfDays - 1)); // Set to 10 days before the last day

  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

export const dateDiffInDays = (a: Date, b: Date) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export function paginateArray<T>(array: T[], itemsPerPage: number): T[][] {
  return array.reduce((acc: T[][], item: T, index: number) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    if (!acc[pageIndex]) {
      acc[pageIndex] = [];
    }
    acc[pageIndex].push(item);
    return acc;
  }, []);
}

export function maskEmail(email: string) {
  if (!email || !email.includes("@")) {
    return email;
  }

  const [localPart, domain] = email.split("@");
  const [domainName, ...topLevelDomains] = domain.split(".");
  const tld = `.${topLevelDomains.join(".")}`;

  let maskedLocalPart;
  if (localPart.length <= 2) {
    maskedLocalPart = localPart;
  } else {
    maskedLocalPart =
      localPart.charAt(0) +
      "*".repeat(Math.max(0, localPart.length - 2)) +
      localPart.charAt(localPart.length - 1);
  }

  const maskedDomainName =
    domainName.slice(0, 2) + "*".repeat(Math.max(0, domainName.length - 2));

  return `${maskedLocalPart}@${maskedDomainName}${tld}`;
}

export function encryptData(text: string, secret: string): string {
  const key = crypto
    .createHash("sha256")
    .update(secret)
    .digest("base64")
    .substr(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptData(encryptedText: string, secret: string): string {
  const key = crypto
    .createHash("sha256")
    .update(secret)
    .digest("base64")
    .substr(0, 32);
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedTextBuffer = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
