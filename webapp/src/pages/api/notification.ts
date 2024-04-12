import type { NextApiRequest, NextApiResponse } from "next";
import webPush from "web-push";

webPush.setVapidDetails(
  `mailto:${process.env.SMTP_FROM_ADDRESS}`,
  process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string,
  process.env.WEB_PUSH_PRIVATE_KEY as string
);

const Notification = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Invalid request method.");
  }

  const { sub, title, message, url } = req.body as {
    sub: webPush.PushSubscription;
    slug: string;
    title: string;
    message: string;
    url?: string;
  };

  webPush
    .sendNotification(
      sub,
      JSON.stringify({
        title,
        message,
        icon: "https://cje.fabrique.social.gouv.fr/pwa/appIcon/maskable_icon_x192.png",
        url,
      })
    )
    .then((response) => {
      res.writeHead(response.statusCode, response.headers).end(response.body);
    })
    .catch((err) => {
      if ("statusCode" in err) {
        res.writeHead(err.statusCode, err.headers).end(err.body);
      } else {
        console.error(err);
        res.statusCode = 500;
        res.end();
      }
    });
};

export default Notification;
