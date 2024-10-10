import {
  Divider,
  Flex,
  Heading,
  Icon,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { IoLockClosed } from "react-icons/io5";
import { PiFlaskFill } from "react-icons/pi";
import ChakraNextImage from "~/components/ChakraNextImage";

const PhoneUnAuthorized = () => {
  const experimentationPartners = [
    {
      name: "la Mission Locale",
      logo: "/images/experimentation/mission-locale.png",
      logoWidth: 87,
      logoHeight: 25,
      description:
        "Dans les antennes de la Mission locale du Val d'Oise Est pour les villes de : Sarcelles, Villiers-le-bel et Garges-les-Gonnesses",
    },
    {
      name: "France Travail",
      logo: "/images/experimentation/france-travail.png",
      logoWidth: 70,
      logoHeight: 25,
      description:
        "Dans les agences France Travail (ex Pôle emploi) de : Sarcelles et Villier-le-bel",
    },
  ];

  return (
    <Flex flexDir={"column"}>
      <Flex pt={8} pb={12} px={6} flexDir={"column"}>
        <Flex alignItems={"center"}>
          <ChakraNextImage
            src="/images/marianne.svg"
            alt="Logo marianne du gouvernement français"
            width={61}
            height={49}
          />
          <Divider
            orientation="vertical"
            mx={4}
            h={12}
            borderColor={"gray.300"}
          />
          <Heading
            textAlign={"center"}
            fontSize={"sm"}
            fontWeight={"extrabold"}
          >
            Ma carte
            <br />
            jeune engagé
          </Heading>
        </Flex>
        <Flex flexDir={"column"} pt={20}>
          <Icon as={IoLockClosed} fontSize="3xl" alignSelf={"center"} />
          <Heading fontWeight={"extrabold"} fontSize={"2xl"} mt={8}>
            On dirait que vous n&apos;êtes pas encore inscrit pour bénéficier de
            la carte jeune engagé
          </Heading>
          <Flex
            color="primary"
            fontWeight={"bold"}
            fontSize={"sm"}
            alignItems={"center"}
            mt={4}
          >
            <Icon as={PiFlaskFill} w={4} h={4} />{" "}
            <Text ml={2}>Application en phase de test</Text>
          </Flex>
          <Text mt={10} fontWeight={"medium"}>
            La carte jeune engagé est une application en cours
            d&apos;expérimentation uniquement dans le département du Val
            d&apos;Oise (95) pour le moment.
          </Text>
          <Divider mt={6} mb={4} borderColor={"gray.300"} />
          <Heading fontSize={"lg"} fontWeight={"extrabold"}>
            À qui s&apos;adresse la carte jeune engagé pour le moment ?
          </Heading>
          <Text fontWeight={"medium"} mt={4}>
            En phase de test la carte jeune engagé s&apos;adresse uniquement :
          </Text>
          <UnorderedList pl={2}>
            <ListItem>Aux jeunes de 18 à 25 ans</ListItem>
            <ListItem>
              Inscrits en parcours Contrat d&apos;Engagement Jeune (CEJ) depuis
              moins de 3 mois
            </ListItem>
            <ListItem>
              Uniquement dans les Missions locales de : [Liste des Missions
              locales]
            </ListItem>
            <ListItem>
              Uniquement dans les agences France Travail de : [Liste des agences
              Pôle emploi]
            </ListItem>
          </UnorderedList>
          <Flex
            flexDir={"column"}
            bg="cje-gray.500"
            borderRadius={"xl"}
            p={6}
            mt={4}
          >
            <Heading fontSize={"lg"} fontWeight={"extrabold"} mb={8}>
              L&apos;application en version test est disponible uniquement pour
              les jeunes en CEJ dans le Val d&apos;Oise
            </Heading>
            {experimentationPartners.map((partner, index) => (
              <>
                {index !== 0 && <Divider borderColor="black" mt={4} mb={6} />}
                <Flex key={index} flexDir={"column"}>
                  <ChakraNextImage
                    src={partner.logo}
                    alt={`Logo partenaire ${index}`}
                    width={partner.logoWidth}
                    height={partner.logoHeight}
                  />
                  <Text fontWeight={"medium"} mt={2}>
                    {partner.description}
                  </Text>
                  <Link
                    fontWeight="bold"
                    textDecor={"underline"}
                    href="mailto:partner@example.loc"
                    mt={2}
                  >
                    Je contacte {partner.name}
                  </Link>
                </Flex>
              </>
            ))}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        justifyContent={"center"}
        alignItems={"center"}
        bg="blackLight"
        color="white"
        py={20}
        textAlign={"center"}
        fontWeight={"extrabold"}
      >
        Footer landing page <br />
        CJE
      </Flex>
    </Flex>
  );
};

export default PhoneUnAuthorized;
