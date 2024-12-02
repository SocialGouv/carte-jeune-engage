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
    apikeys: Apikey;
    categories: Category;
    tags: Tag;
    partners: Partner;
    media: Media;
    offers: Offer;
    coupons: Coupon;
    orders: Order;
    savings: Saving;
    ordersignals: Ordersignal;
    notifications: Notification;
    search_requests: SearchRequest;
    email_auth_tokens: EmailAuthToken;
    forms: Form;
    "form-submissions": FormSubmission;
    "payload-preferences": PayloadPreference;
    "payload-migrations": PayloadMigration;
  };
  globals: {
    quickAccess: QuickAccess;
    landingPartners: LandingPartner;
    landingFAQ: LandingFAQ;
    newCategory: NewCategory;
    categories_list: CategoriesList;
    tags_list: TagsList;
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
  civility?: ("man" | "woman") | null;
  birthDate?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  image?: number | Media | null;
  userEmail?: string | null;
  cejFrom?:
    | (
        | "franceTravail"
        | "missionLocale"
        | "serviceCivique"
        | "ecole2ndeChance"
        | "epide"
      )
    | null;
  timeAtCEJ?: ("started" | "lessThan3Months" | "moreThan3Months") | null;
  hasAJobIdea?: ("yes" | "no") | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  status_image?: ("pending" | "approved") | null;
  preferences?: (number | Tag)[] | null;
  notification_status?: ("enabled" | "disabled") | null;
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
  cej_id?: string | null;
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
  prefix?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tags".
 */
export interface Tag {
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
  kind?: ("ML" | "SC" | "FT") | null;
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
  supervisorKind?: ("ML" | "SC" | "FT") | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "apikeys".
 */
export interface Apikey {
  id: number;
  key: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories".
 */
export interface Category {
  id: number;
  slug: string;
  label: string;
  color?: string | null;
  textWhite?: boolean | null;
  icon: number | Media;
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
  formatedTitle?: string | null;
  subtitle?: string | null;
  description?: string | null;
  partner: number | Partner;
  category: (number | Category)[];
  tags?: (number | Tag)[] | null;
  validityFrom?: string | null;
  validityTo: string;
  published: boolean;
  source: "cje" | "obiz";
  obiz_id?: string | null;
  kind: string;
  cumulative?: boolean | null;
  url?: string | null;
  nbOfEligibleStores?: number | null;
  imageOfEligibleStores?: number | Media | null;
  linkOfEligibleStores?: string | null;
  barcodeFormat?:
    | ("CODE39" | "EAN13" | "ITF14" | "MSI" | "pharmacode" | "codabar" | "upc")
    | null;
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
  conditionBlocks?:
    | {
        slug?: string | null;
        isCrossed?: boolean | null;
        id?: string | null;
      }[]
    | null;
  articles?:
    | {
        available: boolean;
        image?: number | Media | null;
        name: string;
        reference: string;
        description?: string | null;
        reductionPercentage: number;
        validityTo: string;
        kind: "variable_price" | "fixed_price";
        minimumPrice?: number | null;
        maximumPrice?: number | null;
        publicPrice?: number | null;
        price?: number | null;
        obizJson:
          | {
              [k: string]: unknown;
            }
          | unknown[]
          | string
          | number
          | boolean
          | null;
        id?: string | null;
      }[]
    | null;
  nbSeen?: number | null;
  image?: number | Media | null;
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
 * via the `definition` "orders".
 */
export interface Order {
  id: number;
  number: number;
  user: number | User;
  offer: number | Offer;
  ticket?: number | Media | null;
  status:
    | "init"
    | "awaiting_payment"
    | "payment_completed"
    | "delivered"
    | "archived";
  obiz_status?: string | null;
  payment_url?: string | null;
  articles?:
    | {
        article_reference: string;
        article_quantity: number;
        article_montant: number;
        article_montant_discounted: number;
        id?: string | null;
      }[]
    | null;
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
 * via the `definition` "ordersignals".
 */
export interface Ordersignal {
  id: number;
  order: number | Order;
  cause?: string | null;
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
  offer?: (number | null) | Offer;
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
 * via the `definition` "search_requests".
 */
export interface SearchRequest {
  id: number;
  name: string;
  count: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "email_auth_tokens".
 */
export interface EmailAuthToken {
  id: number;
  user: number | User;
  token: string;
  expiration?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "forms".
 */
export interface Form {
  id: number;
  title: string;
  fields?:
    | (
        | {
            name: string;
            label?: string | null;
            required?: boolean | null;
            min?: number | null;
            max?: number | null;
            textLegend?:
              | {
                  label?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: "country";
          }
        | {
            name: string;
            label?: string | null;
            required?: boolean | null;
            placeholder?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: "textarea";
          }
      )[]
    | null;
  submitButtonLabel?: string | null;
  confirmationType?: ("message" | "redirect") | null;
  confirmationMessage?:
    | {
        [k: string]: unknown;
      }[]
    | null;
  redirect?: {
    url: string;
  };
  emails?:
    | {
        emailTo?: string | null;
        cc?: string | null;
        bcc?: string | null;
        replyTo?: string | null;
        emailFrom?: string | null;
        subject: string;
        message?:
          | {
              [k: string]: unknown;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "form-submissions".
 */
export interface FormSubmission {
  id: number;
  form: number | Form;
  submissionData?:
    | {
        field: string;
        value: string;
        id?: string | null;
      }[]
    | null;
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
        relationTo: "admins";
        value: number | Admin;
      }
    | {
        relationTo: "users";
        value: number | User;
      }
    | {
        relationTo: "supervisors";
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
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "newCategory".
 */
export interface NewCategory {
  id: number;
  label: string;
  icon: number | Media;
  items?:
    | {
        offer?: (number | null) | Offer;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories_list".
 */
export interface CategoriesList {
  id: number;
  items?:
    | {
        category: number | Category;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tags_list".
 */
export interface TagsList {
  id: number;
  items?:
    | {
        tag: number | Tag;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

declare module "payload" {
  export interface GeneratedTypes extends Config {}
}
