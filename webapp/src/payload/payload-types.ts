/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    admins: Admin;
    users: User;
    supervisors: Supervisor;
    permissions: Permission;
    media: Media;
    categories: Category;
    partners: Partner;
    offers: Offer;
    coupons: Coupon;
    savings: Saving;
    notifications: Notification;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {
    quickAccess: QuickAccess;
    landingPartners: LandingPartner;
    landingFAQ: LandingFAQ;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "admins".
 */
export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  phone_number: string;
  civility?: ('man' | 'woman') | null;
  birthDate?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  image?: number | Media | null;
  userEmail?: string | null;
  cejFrom?: ('franceTravail' | 'missionLocale') | null;
  timeAtCEJ?: ('started' | 'lessThan3Months' | 'moreThan3Months') | null;
  hasAJobIdea?: ('yes' | 'no') | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  status_image?: ('pending' | 'approved') | null;
  preferences?: (number | Category)[] | null;
  notification_status?: ('enabled' | 'disabled') | null;
  notification_subscription?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  otp_request_token?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: number;
  alt?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories".
 */
export interface Category {
  id: number;
  slug: string;
  label: string;
  icon: number | Media;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supervisors".
 */
export interface Supervisor {
  id: number;
  cgu?: boolean | null;
  kind?: ('ML' | 'SC' | 'FT') | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "permissions".
 */
export interface Permission {
  id: number;
  phone_number: string;
  createdBy?: (number | null) | Supervisor;
  supervisorKind?: ('ML' | 'SC' | 'FT') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "partners".
 */
export interface Partner {
  id: number;
  name: string;
  description?: string | null;
  url?: string | null;
  color: string;
  icon: number | Media;
  stared?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "offers".
 */
export interface Offer {
  id: number;
  title: string;
  partner: number | Partner;
  category: number | Category;
  validityFrom?: string | null;
  validityTo: string;
  kind: 'voucher' | 'voucher_pass' | 'code' | 'code_space';
  url?: string | null;
  nbOfEligibleStores?: number | null;
  imageOfEligibleStores?: number | Media | null;
  linkOfEligibleStores?: string | null;
  barcodeFormat?: ('CODE39' | 'EAN13' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar' | 'upc') | null;
  termsOfUse?:
    | {
        slug?: string | null;
        isHighlighted?: boolean | null;
        id?: string | null;
      }[]
    | null;
  conditions?:
    | {
        text: string;
        id?: string | null;
      }[]
    | null;
  nbSeen?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "coupons".
 */
export interface Coupon {
  id: number;
  code: string;
  used?: boolean | null;
  usedAt?: string | null;
  user?: (number | null) | User;
  assignUserAt?: string | null;
  offer: number | Offer;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "savings".
 */
export interface Saving {
  id: number;
  amount: number;
  coupon: number | Coupon;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "notifications".
 */
export interface Notification {
  id: number;
  slug: string;
  user?: (number | null) | User;
  title: string;
  message?: string | null;
  error?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  appVersion?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user:
    | {
        relationTo: 'admins';
        value: number | Admin;
      }
    | {
        relationTo: 'users';
        value: number | User;
      }
    | {
        relationTo: 'supervisors';
        value: number | Supervisor;
      };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "quickAccess".
 */
export interface QuickAccess {
  id: number;
  items?:
    | {
        partner: number | Partner;
        offer?: (number | null) | Offer;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "landingPartners".
 */
export interface LandingPartner {
  id: number;
  items?:
    | {
        partner: number | Partner;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "landingFAQ".
 */
export interface LandingFAQ {
  id: number;
  items?:
    | {
        title: string;
        content: string;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}