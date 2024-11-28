"use client";

import { useRowLabel } from "@payloadcms/ui";

export const OfferRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{
    name?: string;
    available?: boolean;
  }>();

  return (
    <div>{`${data.available ? "🟢" : "🔴"} ${(rowNumber ?? 0) + 1}. ${data.name ?? ""}`}</div>
  );
};

export const OrderRowLabel = () => {
  const { data } = useRowLabel<{
    article_reference?: string;
    article_quantity?: number;
  }>();

  return (
    <div>{`${data.article_reference ?? ""} (x${data.article_quantity ?? 0})`}</div>
  );
};
