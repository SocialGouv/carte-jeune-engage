import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, Button, Tooltip } from "@chakra-ui/react";
import type { Props } from "payload/components/views/List";
import React, { useEffect, useMemo, useState } from "react";
import { Coupon, User } from "../payload-types";
import CsvDownloader from "react-csv-downloader";
import { useQuery } from "@tanstack/react-query";

const ExportUsers = ({ data }: Props) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userIds = useMemo(() => {
    return data.docs?.map((user: User) => user.id);
  }, [data.docs]);

  const { data: coupons, isLoading: isLoadingCoupons } = useQuery(
    ["coupons", data.docs],
    async () => {
      const permissionChunks = [];
      const chunkSize = 500;

      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        permissionChunks.push(chunk);
      }

      const responses = await Promise.all(
        permissionChunks.map(async (chunk) => {
          const response = await fetch(
            `/api/coupons?pagination=false&limit=${
              chunk.length
            }&depth=0&where[user][in]=${chunk.join(",")}`
          );
          return response.json();
        })
      );

      const coupons = responses.flatMap(
        (response) => response.docs
      ) as Coupon[];

      return { docs: coupons };
    },
    { enabled: data.docs?.length > 0 }
  );

  const columns = [
    {
      id: "phone_number",
      displayName: "Numéro de téléphone",
    },
    {
      id: "address",
      displayName: "Adresse",
    },
    {
      id: "hasAJobIdea",
      displayName: "Projet professionnel (Oui/Non)",
    },
    {
      id: "projectTitle",
      displayName: "Projets professionnel (Titre)",
    },
    {
      id: "projectDescription",
      displayName: "Projets professionnel (Description)",
    },
    {
      id: "civility",
      displayName: "Civilité",
    },
    {
      id: "birthDate",
      displayName: "Date de naissance",
    },
    {
      id: "couponsNumber",
      displayName: "Nombre de coupons activés",
    },
    {
      id: "cejFrom",
      displayName: "Établissement CEJ",
    },
  ];

  useEffect(() => {
    if (data.docs?.length > 0 && !isLoadingCoupons) {
      setCsvData(
        data.docs.map((doc: User) => {
          const userCouponsNumber =
            coupons?.docs.filter((coupon) => coupon.user === doc.id).length ||
            0;

          return {
            phone_number: doc.phone_number,
            address: doc.address,
            hasAJobIdea: doc.hasAJobIdea === "yes" ? "Oui" : "Non",
            projectTitle: doc.projectTitle,
            projectDescription: doc.projectDescription
              ? doc.projectDescription.split(/\r?\n|\r/).join(", ")
              : "",
            civility: doc.civility === "man" ? "Homme" : "Femme",
            birthDate: doc.birthDate,
            cejFrom:
              doc.cejFrom === "franceTravail"
                ? "France travail"
                : doc.cejFrom === "missionLocale"
                  ? "Mission locale"
                  : "Service civique",
            couponsNumber: userCouponsNumber,
          };
        })
      );
      setIsLoading(false);
    }
  }, [data.docs, isLoadingCoupons]);

  return (
    <Box w="fit-content">
      <CsvDownloader
        separator=";"
        filename={`Export_utilisateurs_${new Date().getTime()}`}
        datas={csvData}
        columns={columns}
      >
        <Button
          isDisabled={csvData.length === 0 || isLoading}
          as="label"
          htmlFor="csvInput"
          cursor="pointer"
          className="pill pill--style-light pill--has-link pill--has-action"
        >
          Exporter les utilisateurs
        </Button>
        <Tooltip label="Export des utilisateurs au format CSV" fontSize="xl">
          <QuestionOutlineIcon ml={4} fontSize="2xl" />
        </Tooltip>
      </CsvDownloader>
    </Box>
  );
};

export default ExportUsers;
