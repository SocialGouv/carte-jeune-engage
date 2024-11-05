import { TRPCError } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";
import getPayloadClient from "~/payload/payloadClient";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";

const WidgetTokenGenerator = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).send("Invalid request method.");
  }

  const { user_id } = req.body as {
    user_id: string;
  };

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header." });
  }
  const api_key = authorizationHeader.split(" ")[1];

  try {
    const payload = await getPayloadClient({ seed: false });
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      payload,
      session: null,
      soapObizClient: null,
      req,
    });

    const result = await caller.widget.generateToken({
      user_id,
      api_key,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof TRPCError) {
      return res.status(400).json({ message: error.message, code: error.code });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export default WidgetTokenGenerator;
