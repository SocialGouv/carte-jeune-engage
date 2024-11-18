import { Box, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "../components/ui/Image";
import RedirectionSectionBlock from "~/components/landing/RedirectionSectionBlock";
import { PartnerIncluded } from "~/server/api/routers/partner";
import { api } from "~/utils/api";

const HomePartners = () => {
  const { data: resultPartners } = api.partner.getList.useQuery({
    page: 1,
    perPage: 100,
    sort: "name",
  });

  const { data: partners } = resultPartners || {
    data: [] as PartnerIncluded[],
  };

  // group by first letter of name
  const groupedPartners = partners?.reduce(
    (acc, partner) => {
      const firstLetter = partner.name[0].toUpperCase();

      if (!acc[firstLetter]) acc[firstLetter] = [];

      acc[firstLetter].push(partner);

      return acc;
    },
    {} as Record<string, typeof partners>
  );

  return (
    <Box px={{ base: 0, lg: "15%" }}>
      <Box mt={16} px={{ base: 10, lg: 0 }}>
        <Heading as="h2" fontSize="3xl" mb={4}>
          Les entreprises engagées
        </Heading>
        <Text fontWeight={500}>
          Les tarifs réduits disponibles sont négociés auprès de chaque
          entreprise. Les utilisateurs peuvent donner leur avis sur les
          réductions et demander à de nouvelles marques d’être ajoutées dans
          l’application.
        </Text>
        {Object.keys(groupedPartners).map((letter) => (
          <>
            <Divider mt={8} mb={2} />
            <Box key={letter}>
              <Heading as="h3" fontSize="3xl" fontWeight={800} mb={3}>
                {letter}
              </Heading>
              <Flex flexDir="column" flexWrap="wrap">
                {groupedPartners[letter].map((partner) => (
                  <Flex
                    key={partner.id}
                    alignItems="center"
                    justifyContent="start"
                    mb={4}
                    gap={2}
                    w="full"
                  >
                    <Image
                      src={partner.icon.url || ""}
                      alt={partner.name}
                      width={48}
                      height={48}
                    />
                    <Heading as="h4" fontSize="xl">
                      {partner.name}
                    </Heading>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </>
        ))}
      </Box>
      <Box mt={20} px={{ base: 2, lg: 0 }}>
        <RedirectionSectionBlock />
      </Box>
    </Box>
  );
};

export default HomePartners;
