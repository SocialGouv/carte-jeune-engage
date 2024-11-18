import { S3 } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const s3Client = new S3({
  endpoint: process.env.S3_ENDPOINT ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.S3_REGION ?? "",
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({ status: "error" });
    return;
  }

  const { filename } = req.query;

  if (!filename) {
    res.status(400).json({ status: "error" });
    return;
  }

  try {
    const s3Response = await s3Client.getObject({
      Bucket: process.env.S3_BUCKET_NAME ?? "",
      Key: path.join("public", filename as string).replace(/\\/g, "/"),
    });

    res.setHeader("Content-Type", s3Response.ContentType ?? "");

    res.send(s3Response.Body);
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};
