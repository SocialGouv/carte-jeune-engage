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

  const { numero, article_id } = req.query as {
    numero?: string;
    article_id?: string;
  };

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

    if (numero) {
      console.log("obiz synchronizing order", numero);

      const orderId = await caller.order.getIdByNumber({
        number: parseInt(numero),
      });

      caller.order
        .synchronizeOrder({
          order_id: orderId.data,
        })
        .then((order) => {
          console.log(
            `Finish synchronizing obiz order : [numero: ${numero} / obiz status : ${order.data.obiz_status} / cje status : ${order.data.status}]`
          );
        });
    } else if (article_id) {
      console.log("obiz synchronizing article", article_id);
      caller.offer
        .synchronizeObizOffer({
          article_id,
        })
        .then(({ offer, updateArticles, article_actif }) => {
          if (updateArticles) {
            console.log(
              `Finish synchronizing obiz offer : [${offer.formatedTitle} : article ${article_actif ? "listed" : "delisted"} (${article_id})]`
            );
          } else {
            console.log(`Nothing to synchronize`);
          }
        })
        .catch((e) => {
          if (e.code === "NOT_FOUND") {
            console.log(
              `Error synchronizing obiz offer with article_id ${article_id} - Offer not found`
            );
          } else {
            console.log(
              `Error synchronizing obiz offer with article_id ${article_id} - Unknow error`
            );
          }
        });
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No order number or article_id provided`,
      });
    }

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
