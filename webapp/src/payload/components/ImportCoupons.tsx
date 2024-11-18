import React, { useState } from "react";
import { MinimalTemplate } from "payload/components/templates";
import type { Props } from "payload/components/views/List";
import usePayloadAPI from "payload/dist/admin/hooks/usePayloadAPI";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Select,
  Tooltip,
  Progress,
  Text,
  Stack,
} from "@chakra-ui/react";
import { Modal, useModal } from "@faceless-ui/modal";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { toast } from "react-toastify";
import { Coupon } from "../payload-types";
import { OfferIncluded } from "~/server/api/routers/offer";

// Number of concurrent requests
const CONCURRENCY_LIMIT = 5;

interface CSVRow {
  code: string;
  [key: string]: any;
}

const ImportCoupons = ({ hasCreatePermission, resetParams }: Props) => {
  const { toggleModal } = useModal();
  const modalSlug = "modal-import-coupons";

  const [csvFileValue, setCsvFileValue] = useState<string>("");
  const [offerId, setOfferId] = useState<number>();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [importQueue, setImportQueue] = useState<any[]>([]);

  const [
    {
      data: { docs },
    },
  ] = usePayloadAPI("/api/offers", {
    initialParams: {
      page: 1,
      limit: 1000,
    },
  });
  const offers = docs as OfferIncluded[];

  const createCoupon = useMutation({
    mutationFn: async (coupon: Coupon) => {
      const response = await fetch("/api/coupons", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coupon),
      });
      if (!response.ok) {
        throw new Error(`Failed to create coupon: ${coupon.code}`);
      }
      return response;
    },
  });

  // Process queue with concurrency control
  const processQueue = async (coupons: Coupon[]) => {
    setIsImporting(true);
    setStats({ total: coupons.length, success: 0, failed: 0 });
    setProgress(0);
    setImportQueue(coupons);

    const results = {
      success: 0,
      failed: 0,
    };

    // Process in chunks based on concurrency limit
    for (let i = 0; i < coupons.length; i += CONCURRENCY_LIMIT) {
      const chunk = coupons.slice(i, i + CONCURRENCY_LIMIT);

      // Create promises for current chunk
      const promises = chunk.map((coupon) =>
        createCoupon
          .mutateAsync({ ...coupon, offer: offerId as number })
          .then(() => {
            results.success++;
            setStats((prev) => ({ ...prev, success: prev.success + 1 }));
            return true;
          })
          .catch(() => {
            results.failed++;
            setStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
            return false;
          })
      );

      // Wait for current chunk to complete
      await Promise.all(promises);

      // Update progress
      const currentProgress = Math.min(
        ((i + CONCURRENCY_LIMIT) / coupons.length) * 100,
        100
      );
      setProgress(currentProgress);

      // Remove processed coupons from queue
      setImportQueue((prev) => prev.slice(CONCURRENCY_LIMIT));

      // Add small delay between chunks to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileValue("");

    // Properly typed Papa Parse configuration
    const parseConfig: Papa.ParseConfig<CSVRow> = {
      header: true,
      dynamicTyping: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        const couponsToCreate = results.data
          .filter((row) => row.code)
          .map((row) => ({
            code: row.code,
            offer: -1,
          }));

        if (!couponsToCreate.length) {
          toast.error("Erreur dans le format du CSV");
          return;
        }

        toggleModal(modalSlug);
        setStats({ total: couponsToCreate.length, success: 0, failed: 0 });
        setImportQueue(couponsToCreate);
      },
    };

    // Use FileReader to handle the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result;
      if (typeof csv === "string") {
        Papa.parse(csv, parseConfig);
      }
    };
    reader.readAsText(file);
  };

  const validate = async () => {
    if (!offerId) {
      toast.error("Veuillez sélectionner une offre");
      return;
    }

    try {
      const results = await processQueue(importQueue);

      if (results.success > 0) {
        toast.success(`${results.success} bons de réduction importés`);
      }
      if (results.failed > 0) {
        toast.error(`Échec de l'import de ${results.failed} bons de réduction`);
      }

      resetParams();
    } catch (error) {
      toast.error("Une erreur est survenue pendant l'import");
    } finally {
      setIsImporting(false);
      toggleModal(modalSlug);
      setImportQueue([]);
      setProgress(0);
    }
  };

  if (!hasCreatePermission || !offers) return null;

  return (
    <Box>
      <input
        id="csvInput"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        value={csvFileValue}
        onClick={() => setCsvFileValue("")}
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
              onChange={(e) => setOfferId(parseInt(e.target.value))}
              required
              isDisabled={isImporting}
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

          {(isImporting || stats.total > 0) && (
            <Stack spacing={3} mt={4}>
              <Text>Import en cours... {Math.round(progress)}%</Text>
              <Progress value={progress} max={100} />
              <Stack direction="row" spacing={4} fontSize="sm" color="gray.600">
                <Text>Total: {stats.total}</Text>
                <Text color="green.500">Succès: {stats.success}</Text>
                <Text color="red.500">Échecs: {stats.failed}</Text>
                <Text>Restants: {importQueue.length}</Text>
              </Stack>
            </Stack>
          )}

          <Flex mt={4} justifyContent="flex-start">
            <Button
              onClick={() => toggleModal(modalSlug)}
              className="btn btn--style-secondary"
              isDisabled={isImporting}
            >
              Annuler
            </Button>
            <Button
              colorScheme="whiteBtn"
              color="black"
              ml={4}
              onClick={validate}
              className="btn btn--style-primary"
              isDisabled={isImporting || importQueue.length === 0}
              isLoading={isImporting}
            >
              {isImporting ? "Import en cours..." : "Valider"}
            </Button>
          </Flex>
        </MinimalTemplate>
      </Modal>
    </Box>
  );
};

export default ImportCoupons;
