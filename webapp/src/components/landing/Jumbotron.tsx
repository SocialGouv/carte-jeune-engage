import {
  Box,
  Flex,
  Text,
  Heading,
  useBreakpointValue,
  Image,
  Button,
  useBoolean,
  Icon,
} from "@chakra-ui/react";
import EllipsePositionnedImages from "./EllipsePositionnedImages";
import { useRef, useEffect, useState } from "react";
import { HiPause, HiPlay } from "react-icons/hi2";

const Jumbotron = () => {
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldAnimate, { toggle: toggleShouldAnimate }] = useBoolean(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ellipseImages =
    useBreakpointValue({
      base: [
        "/images/seeds/tags/sport_equipment.png",
        "/images/seeds/tags/computer.png",
        "/images/seeds/tags/grocery.png",
        "/images/seeds/tags/license.png",
        "/images/seeds/tags/culture.png",
        "/images/seeds/tags/clothes.png",
      ],
      lg: [
        "/images/seeds/tags/sport_equipment.png",
        "/images/seeds/tags/books.png",
        "/images/seeds/tags/bike.png",
        "/images/seeds/tags/culture.png",
        "/images/seeds/tags/computer.png",
        "/images/seeds/tags/grocery.png",
        "/images/seeds/tags/washing_machine.png",
        "/images/seeds/tags/desk_equipment.png",
        "/images/seeds/tags/license.png",
        "/images/seeds/tags/clothes.png",
      ],
    }) || [];

  return (
    <Flex
      flexDir="column"
      justify={"center"}
      align={"center"}
      textAlign="center"
      gap={8}
      mt={{ base: 28, lg: 44 }}
      mb={{ base: 24, lg: 36 }}
      pos={"relative"}
      ref={firstSectionRef}
    >
      <Image
        src="/images/cje-logo.png"
        alt="Logo de l'application Carte Jeune Engagé"
        width={{ base: "116px", lg: "176px" }}
        height={{ base: "64px", lg: "94px" }}
      />
      <Flex flexDir={"column"} w={"80%"} alignItems={"center"}>
        <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="extrabold">
          Des avantages pour les jeunes
          <Box as="br" display={{ base: "none", lg: "block" }} /> qui s'engagent
          pour leur avenir
        </Heading>
        <Text
          fontSize={{ base: "xs", lg: "sm" }}
          fontWeight="medium"
          color="disabled"
          mt={8}
        >
          Dispositif en cours d'expérimentation
        </Text>
        <Button
          display={{ base: "none", lg: "flex" }}
          w={"fit-content"}
          h={"fit-content"}
          justifyContent={"center"}
          alignItems={"center"}
          onClick={toggleShouldAnimate}
          variant={"unstyled"}
          color="disabled"
          _hover={{ bg: "gray.100" }}
          p={2}
          mt={2}
          lineHeight={0}
          fontWeight={"extrabold"}
        >
          <Icon as={shouldAnimate ? HiPause : HiPlay} mr={2} />
          <Text as="span" fontSize={{ base: "xs", lg: "sm" }}>
            Animation
          </Text>
        </Button>
      </Flex>
      {isMounted && (
        <EllipsePositionnedImages
          images={ellipseImages}
          parentRef={firstSectionRef}
          isPlayingAnimation={shouldAnimate}
        />
      )}
    </Flex>
  );
};

export default Jumbotron;
