import { Payload } from "payload";
import { getBaseUrl } from "./tools";

type NotificationParams = {
  sub: any;
  payload: Payload;
  userId: number;
  payloadNotification: {
    title: string;
    message?: string;
    slug: string;
    url?: string;
  };
};

type NotificationResponse = {
  notificationSent: boolean;
  notificationInDb: boolean;
  error: string;
};

export async function sendPushNotification({
  sub,
  payload,
  userId,
  payloadNotification,
}: NotificationParams): Promise<NotificationResponse> {
  const { title, message, slug, url } = payloadNotification;

  const notifications = await payload.find({
    collection: "notifications",
    where: {
      slug: {
        equals: slug,
      },
      user: {
        equals: userId,
      },
      createdAt: {
        greater_than_equal: new Date().toISOString().split("T")[0],
      },
    },
  });

  const notificationSent = notifications.docs[0];

  if (notificationSent) {
    console.log("[Notification db create] - Already sent", {
      notificationId: notificationSent.id,
      slug,
      user: userId,
    });
    return {
      notificationSent: false,
      notificationInDb: false,
      error: "",
    };
  }

  return await fetch(
    `${
      process.env.NODE_ENV === "production"
        ? "http://app"
        : "http://localhost:3000"
    }/api/notification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sub,
        title,
        message,
        slug,
        url,
      }),
    }
  )
    .then(async () => {
      return await payload
        .create({
          collection: "notifications",
          data: {
            slug,
            title,
            appVersion: process.env.NEXT_PUBLIC_CURRENT_PACKAGE_VERSION,
            user: userId,
          },
        })
        .then((notification) => {
          console.log("[Notification db create] - Success", {
            id: notification.id,
            slug,
            user: userId,
          });
          return {
            notificationSent: true,
            notificationInDb: true,
            error: "",
          };
        })
        .catch((error) => {
          console.error("[Notification db create] - Error", error);
          return {
            notificationSent: true,
            notificationInDb: false,
            error: error,
          };
        });
    })
    .catch((error) => {
      console.error("[Notification web push sending] - Error", error);
      return {
        notificationSent: false,
        notificationInDb: false,
        error: error,
      };
    });
}
