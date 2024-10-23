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
import {
  Bodies,
  Engine,
  Events,
  IChamferableBodyDefinition,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";
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

const partnerItemClassName = "partner-item";

const PartnerSectionWithPhysics = ({}: PartnerSectionProps) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const arePhysicsTriggered = useInView(canvasRef, {
    once: true,
    amount: 1,
  });

  useEffect(() => {
    if (!arePhysicsTriggered || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = Engine.create();
    const runner = Runner.create();

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        wireframeBackground: "transparent",
        background: "transparent",
      },
    });

    Render.run(render);
    Runner.run(runner, engine);

    const partnerElements =
      document.getElementsByClassName(partnerItemClassName);
    // Creates Matter.js bodies dynamically for each partner element
    const partnerBodies = Array.from(partnerElements).map((element, index) => {
      const html_element = element as HTMLElement;
      const width = html_element.offsetWidth;
      const height = html_element.offsetHeight;
      const x = html_element.offsetLeft + width / 2;
      const y = html_element.offsetTop + height / 2;

      const body = Bodies.rectangle(x, y, width, height, {
        restitution: 0.5, // Bounciness
        friction: 0.3,
        slop: 0.01,
        density: 0.01,
        render: {
          // remove border
          visible: false,
        },
      });
      World.add(engine.world, body);
      return { body, element: html_element }; // Returns the body and the DOM element
    });

    const innerOffset = 45;
    const wallsOptions: IChamferableBodyDefinition = {
      isStatic: true,
      friction: 1,
      render: { visible: false },
    };

    // Create walls around the parent element
    const bottom = Bodies.rectangle(
      canvas.clientWidth / 2,
      canvas.clientHeight + innerOffset,
      canvas.clientWidth + 200,
      100,
      wallsOptions
    );
    const top = Bodies.rectangle(
      canvas.clientWidth / 2,
      -innerOffset,
      canvas.clientWidth + 200,
      100,
      wallsOptions
    );
    const left = Bodies.rectangle(
      -innerOffset,
      canvas.clientHeight / 2,
      100,
      canvas.clientHeight + 200,
      wallsOptions
    );
    const right = Bodies.rectangle(
      canvas.clientWidth + innerOffset,
      canvas.clientHeight / 2,
      100,
      canvas.clientHeight + 200,
      wallsOptions
    );
    World.add(engine.world, [bottom, top, left, right]);

    // Mouse control
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,

      constraint: {
        damping: 0.2,
        stiffness: 1,
        render: { visible: false },
      },
    });
    World.add(engine.world, mouseConstraint);

    // Update function for DOM position synced with matter-js bodies
    const update = () => {
      partnerBodies.forEach(({ body, element }) => {
        const { x, y } = body.position;

        element.style.left = `${x - element.offsetWidth / 2}px`;
        element.style.top = `${y - element.offsetHeight / 2}px`;
        element.style.rotate = `${body.angle}rad`;

        element.style.position = "absolute";
      });
      requestAnimationFrame(update);
    };

    update();

    return () => {
      Runner.stop(runner);
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [arePhysicsTriggered]);

  // TODO: Make rounded border rectangles
  // TODO: Handle scroll when in canvas
  // TODO: Handle link click when in canvas
  // TODO: Fix image hitboxes

  return (
    <Flex
      flexDir={{ base: "column", lg: "row" }}
      pos={"relative"}
      bg={"primary"}
      w={{ base: "95%", lg: "full" }}
      mx={"auto"}
      rounded="5xl"
      color={"white"}
      mt={isDesktop ? 0 : 20}
    >
      <Box as="canvas" ref={canvasRef} pos={"absolute"} w={"full"} h={"full"} />
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
              h={14}
              w={"fit-content"}
              p={4}
              className={partnerItemClassName}
              pointerEvents={"none"}
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
              h={14}
              p={4}
              pointerEvents={"none"}
              className={partnerItemClassName}
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
