import { TRPCError } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";
import getPayloadClient from "~/payload/payloadClient";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { obiz_soap_client_options } from "~/server/soap-obiz";
var soap = require("soap");

export const obiz_soap_client_url = process.env.OBIZ_SOAP_URL;

const ObizSync = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Invalid request method.");
  }

  const { numero } = req.query as {
    numero: string;
  };

  console.log("obiz synchronizing order", numero);

  try {
    const payload = await getPayloadClient({ seed: false });
    const createCaller = createCallerFactory(appRouter);

    var soapObizClient = await soap.createClientAsync(
      obiz_soap_client_url,
      obiz_soap_client_options
    );

    const caller = createCaller({
      payload,
      session: null,
      soapObizClient,
      req,
    });

    const orderId = await caller.order.getIdByNumber({
      number: parseInt(numero),
    });

    caller.order.synchronizeOrder({
      order_id: orderId.data,
    });

    return res.status(200).json({ data: "ok" });
  } catch (error) {
    if (error instanceof TRPCError) {
      return res.status(400).json({ message: error.message, code: error.code });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export default ObizSync;
