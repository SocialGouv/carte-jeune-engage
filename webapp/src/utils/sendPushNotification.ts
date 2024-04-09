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
  const { title, message, slug } = payloadNotification;

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
        equals: new Date().toISOString().split("T")[0],
      },
    },
  });

  const notificationAlreadySent = notifications.docs.length > 0;

  if (notificationAlreadySent) {
    console.log("[Notification db create] - Already sent", {
      slug,
      user: userId,
    });
    return {
      notificationSent: true,
      notificationInDb: true,
      error: "",
    };
  }

  return await fetch(`${getBaseUrl()}/api/notification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sub,
      title,
      message,
      slug,
    }),
  })
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
