import {
  Box,
  Flex,
  Heading,
  Image,
  Link,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useInView } from "framer-motion";
import { Engine, Render } from "matter-js";
import NextLink from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface PartnerSectionProps {}

const partnersList = [
  {
    name: "Auchan",
    img: "/images/seeds/partners/auchan.svg",
    promo_label: "-110€",
  },
  {
    name: "Flixbus",
    img: "/images/seeds/partners/flixbus.svg",
    promo_label: "-10%",
  },
  {
    name: "Cora",
    img: "/images/seeds/partners/cora.svg",
    promo_label: "Gratuit",
  },
];
const PartnerSectionWithPhysics = ({}: PartnerSectionProps) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const [physicBodies, setPhysicBodies] = useState([]);

  const parentPartnersRef = useRef<HTMLDivElement>(null);

  const arePhysicsTriggered = useInView(parentPartnersRef, {
    once: true,
    amount: 1,
  });

  useEffect(() => {
    if (!arePhysicsTriggered || !parentPartnersRef.current) return;

    const parent = parentPartnersRef.current;
    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: parent,
      engine: engine,
      options: {
        width: parent.clientWidth,
        height: parent.clientHeight,
        wireframes: false,
      },
    });
  }, [arePhysicsTriggered]);

  return (
    <Flex
      flexDir={{ base: "column", lg: "row" }}
      bg={"primary"}
      w={{ base: "95%", lg: "full" }}
      mx={"auto"}
      rounded="5xl"
      color={"white"}
      mt={isDesktop ? 0 : 20}
      ref={parentPartnersRef}
    >
      <Flex
        flex={1}
        flexDir="column"
        p={{ base: 8, lg: 44 }}
        pr={{ lg: 8 }}
        pt={12}
      >
        <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="extrabold">
          Une appli utile avec des réductions de grandes marques
        </Heading>
        <Link
          as={NextLink}
          href="/partners"
          mt={6}
          textDecor={"underline"}
          fontWeight={"bold"}
          fontSize={{ lg: "lg" }}
          passHref
        >
          Voir toutes les entreprises
          <Box as="br" display={{ base: "block", lg: "none" }} /> engagées →
        </Link>
      </Flex>
      <Flex
        flex={1}
        flexDir="column"
        justify={"center"}
        p={{ base: 8, lg: 44 }}
        px={{ lg: 8 }}
        pt={0}
        overflow="hidden"
      >
        {partnersList.map((partner, index) => (
          <Flex
            key={`partner-${index}`}
            className="partner-item"
            flexDir={index % 2 === 0 ? "row" : "row-reverse"}
            justifyContent={{ base: "start", lg: "center" }}
            mb={4}
            gap={2}
            h={{ base: 14, lg: 14 }}
          >
            <Flex
              alignItems="center"
              justifyContent="center"
              bg="white"
              rounded="full"
              p={4}
            >
              <Image src={partner.img} alt={`Logo de ${partner.name}`} />
            </Flex>
            <Flex
              as={Text}
              align="center"
              bg="black"
              fontWeight="extrabold"
              rounded="full"
              fontSize="xl"
              p={4}
            >
              {partner.promo_label}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default PartnerSectionWithPhysics;
