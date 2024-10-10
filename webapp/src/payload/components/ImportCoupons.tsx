import { QuestionOutlineIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { Modal, useModal } from "@faceless-ui/modal";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { MinimalTemplate } from "payload/components/templates";
import type { Props } from "payload/components/views/List";
import usePayloadAPI from "payload/dist/admin/hooks/usePayloadAPI";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { OfferIncluded } from "~/server/api/routers/offer";
import { api } from "~/utils/api";
import { Coupon } from "../payload-types";

export type ImportCouponsProps = {};

const ImportCoupons = ({ hasCreatePermission, resetParams }: Props) => {
  const { toggleModal } = useModal();
  const modalSlug = "modal-import-coupons";

  const [csvFileValue, setCsvFileValue] = useState<string | undefined>("");
  const [offerId, setOfferId] = useState<number>();
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [
    {
      data: { docs },
    },
  ] = usePayloadAPI(`/api/offers`, {
    initialParams: {
      page: 1,
      limit: 1000,
    },
  });
  const offers = docs as OfferIncluded[];

  const createCoupons = useMutation({
    mutationFn: (payload: Coupon) => {
      return fetch("/api/coupons", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setCsvFileValue(undefined);
      Papa.parse(file, {
        complete: (result) => {
          const couponsToCreate = result.data
            .filter((row: any) => row.code)
            .map((row: any) => {
              return {
                code: row.code as string,
                offer: -1,
              } as Coupon;
            });

          if (!couponsToCreate.length) {
            toast.error("Erreur dans le format du CSV");
            return;
          }

          setCoupons(couponsToCreate);
          toggleModal(modalSlug);
        },
        header: true,
        dynamicTyping: true,
      });
    }
  };

  const validate = () => {
    if (!offerId) return;

    if (coupons.length) {
      const promises: Promise<any>[] = [];
      coupons.forEach((coupon) => {
        promises.push(createCoupons.mutateAsync({ ...coupon, offer: offerId }));
      });
      Promise.all(promises).then((responses) => {
        const okRequestsCount = responses.filter((r) => r.ok).length;
        const koRequestsCount = responses.filter((r) => !r.ok).length;

        if (okRequestsCount)
          toast.success(`${okRequestsCount} bons de réduction importés`);

        if (koRequestsCount)
          toast.error(
            `Erreur à l'import bons de réduction en base de donnée (${koRequestsCount} bons de réduction)`
          );

        setCoupons([]);
        resetParams();
      });
    }

    toggleModal(modalSlug);
  };

  if (!hasCreatePermission || !offers) return;

  return (
    <Box>
      <input
        id="csvInput"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        value={csvFileValue}
        onClick={() => {
          setCsvFileValue("");
        }}
        style={{ display: "none" }}
      />
      <Button
        as="label"
        htmlFor="csvInput"
        cursor="pointer"
        className="pill pill--style-light pill--has-link pill--has-action"
      >
        Importer des bons de réduction
      </Button>
      <Tooltip
        label="Fichier .csv requis, comprenant une colonne intitulée 'code' avec un code distinct par ligne pour l'importation."
        fontSize="xl"
      >
        <QuestionOutlineIcon ml={4} fontSize="2xl" />
      </Tooltip>
      <Modal slug={modalSlug} className="delete-document">
        <MinimalTemplate className="delete-document__template">
          <Heading size="lg">
            Offre pour laquelle importer des bons de réduction :
          </Heading>
          <FormControl>
            <Select
              placeholder="Sélectionner une offre"
              onChange={(e) => {
                setOfferId(parseInt(e.target.value));
              }}
              required
            >
              {offers
                .sort((a, b) => (a.partner.name < b.partner.name ? -1 : 1))
                .map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    [{offer.partner.name}] {offer.title}
                  </option>
                ))}
            </Select>
          </FormControl>
          <Flex mt={4} justifyContent={"flex-start"}>
            <Button
              onClick={() => {
                toggleModal(modalSlug);
              }}
              className="btn btn--style-secondary"
            >
              Annuler
            </Button>
            <Button
              colorScheme="whiteBtn"
              color="black"
              ml={4}
              onClick={validate}
              className="btn btn--style-primary"
            >
              Valider
            </Button>
          </Flex>
        </MinimalTemplate>
      </Modal>
    </Box>
  );
};

export default ImportCoupons;
