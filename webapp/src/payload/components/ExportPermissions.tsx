import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, Button, Tooltip } from "@chakra-ui/react";
import type { Props } from "payload/components/views/List";
import usePayloadAPI from "payload/dist/admin/hooks/usePayloadAPI";
import React, { useEffect, useMemo, useState } from "react";
import { Permission, User } from "../payload-types";
import CsvDownloader from "react-csv-downloader";
import { useQuery } from "@tanstack/react-query";

const ExportPermissions = ({ data }: Props) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  const permissionPhoneNumbers = useMemo(() => {
    return data.docs?.map((user: User) => user.phone_number).join(",");
  }, [data.docs]);

  const { data: users } = useQuery(
    ["users", data.docs?.length],
    async () => {
      const response = await fetch(
        `/api/users?pagination=false&where[phone_number][in]=${permissionPhoneNumbers}`
      );
      return response.json();
    },
    { enabled: data.docs?.length > 0 }
  );

  const columns = [
    {
      id: "phone_number",
      displayName: "Numéro de téléphone",
    },
    {
      id: "kind",
      displayName: "Type de compte",
    },
    {
      id: "permissionCreatedAt",
      displayName: "Date de création (Autorisation)",
    },
    {
      id: "userCreatedAt",
      displayName: "Date de création (Utilisateur)",
    },
  ];

  useEffect(() => {
    if (users && data?.docs?.length > 0) {
      console.log(users);
      setCsvData(
        data.docs.map((permission: Permission) => {
          const currentUser = users.docs.find(
            (user: User) => user.phone_number === permission.phone_number
          ) as User | undefined;
          return {
            phone_number: permission.phone_number,
            permissionCreatedAt: permission.createdAt,
            userCreatedAt: currentUser?.createdAt || "Non trouvé",
            kind:
              permission.supervisorKind === "ML"
                ? "Mission Locale"
                : permission.supervisorKind === "FT"
                ? "France Travail"
                : "Service Civique",
          };
        })
      );
    }
  }, [users]);

  return (
    <Box w="fit-content">
      <CsvDownloader
        filename={`Export_utilisateurs_${new Date().getTime()}`}
        datas={csvData}
        columns={columns}
      >
        <Button
          isDisabled={csvData.length === 0}
          as="label"
          htmlFor="csvInput"
          cursor="pointer"
          className="pill pill--style-light pill--has-link pill--has-action"
        >
          Exporter les autorisations
        </Button>
        <Tooltip label="Export des autorisations au format CSV" fontSize="xl">
          <QuestionOutlineIcon ml={4} fontSize="2xl" />
        </Tooltip>
      </CsvDownloader>
    </Box>
  );
};

export default ExportPermissions;
