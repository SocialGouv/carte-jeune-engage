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
  Body,
  Engine,
  Events,
  IBodyDefinition,
  IChamferableBodyDefinition,
  Mouse,
  MouseConstraint,
  Query,
  Render,
  Runner,
  World,
} from "matter-js";
import NextLink from "next/link";
import React, { useEffect, useRef } from "react";

const partnersList = [
  {
    name: "Deezer",
    img: "/images/landing/partners/deezer.png",
    promo_label: "-50%",
    imgHeight: { base: 20, lg: 28 },
  },
  {
    name: "AXA",
    img: "/images/landing/partners/axa.png",
    promo_label: "-100€",
  },
  {
    name: "La poste mobile",
    img: "/images/landing/partners/la-poste-mobile.png",
    promo_label: "-10€",
  },
];

const partnerItemClassName = "partner-item";

const PartnerSectionWithPhysics = () => {
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

    const bodyProps: IBodyDefinition = {
      restitution: 0.5,
      friction: 0.3,
      slop: 0.01,
      density: 0.01,
      render: {
        visible: false,
      },
    };
    // Creates Matter.js bodies dynamically for each partner element
    const partnerBodies = Array.from(partnerElements).map((element, index) => {
      const html_element = element as HTMLElement;
      const width = html_element.offsetWidth;
      const height = html_element.offsetHeight;
      const x = html_element.offsetLeft + width / 2;
      const y = html_element.offsetTop + height / 2;

      let body;
      if (width === height) {
        body = Bodies.circle(x, y, width / 2, bodyProps);
      } else if (width < height) {
        const rectangle = Bodies.rectangle(x, y, width, height - width);
        const topCircle = Bodies.circle(x, y - (height - width) / 2, width / 2);
        const bottomCircle = Bodies.circle(
          x,
          y + (height - width) / 2,
          width / 2
        );

        body = Body.create({
          ...bodyProps,
          parts: [rectangle, topCircle, bottomCircle],
        });
      } else {
        const rectangle = Bodies.rectangle(x, y, width - height, height);
        const leftCircle = Bodies.circle(
          x - (width - height) / 2,
          y,
          height / 2
        );
        const rightCircle = Bodies.circle(
          x + (width - height) / 2,
          y,
          height / 2
        );

        body = Body.create({
          ...bodyProps,
          parts: [rectangle, leftCircle, rightCircle],
        });
      }

      World.add(engine.world, body);
      return { body, element: html_element }; // Returns the body and the DOM element
    });

    const innerOffset = 50;
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

    // Handle cursor change on mouse over body
    let mouseDown = false;
    const isMouseOverBody = () =>
      Query.point(
        partnerBodies.map(({ body }) => body),
        mouse.position
      ).length > 0;

    Events.on(engine, "beforeUpdate", () => {
      if (isMouseOverBody()) {
        canvas.style.cursor = mouseDown ? "grabbing" : "grab";
      } else {
        canvas.style.cursor = "default";
      }
    });
    Events.on(mouseConstraint, "mousedown", () => (mouseDown = true));
    Events.on(mouseConstraint, "mouseup", () => (mouseDown = false));

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
      p={{ base: 8, lg: 44 }}
    >
      <Box
        as="canvas"
        ref={canvasRef}
        pos={"absolute"}
        top={0}
        left={0}
        w={"full"}
        h={"full"}
        onWheelCapture={(e: React.WheelEvent) => e.stopPropagation()}
        pointerEvents={isDesktop ? "auto" : "none"}
      />
      <Flex flex={1} flexDir="column" justify={"center"}>
        <Heading
          fontSize={{ base: "2xl", lg: "5xl" }}
          fontWeight="extrabold"
          userSelect={"none"}
        >
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
          w={"fit-content"}
          zIndex={10}
          userSelect={"none"}
        >
          Voir toutes les entreprises
          <Box as="br" display={{ base: "block", lg: "none" }} /> engagées →
        </Link>
      </Flex>
      <Flex
        flex={1}
        flexDir="column"
        justify={"center"}
        align={{ base: "center", lg: "end" }}
        p={8}
        px={0}
        overflow="hidden"
      >
        {partnersList.map((partner, index) => (
          <Flex
            key={`partner-${index}`}
            flexDir={index % 2 === 0 ? "row" : "row-reverse"}
            align={"center"}
            justifyContent={{ base: "start", lg: "center" }}
            mb={index < partnersList.length - 1 ? 8 : undefined}
            gap={4}
            h={14}
          >
            <Flex
              alignItems="center"
              justifyContent="center"
              bg="white"
              rounded="full"
              h={partner.imgHeight ? partner.imgHeight : { base: 16, lg: 20 }}
              p={{ base: 3, lg: 4 }}
              className={partnerItemClassName}
              pointerEvents={"none"}
              userSelect={"none"}
            >
              <Image
                src={partner.img}
                alt={`Logo de ${partner.name}`}
                h={"full"}
              />
            </Flex>
            <Flex
              as={Text}
              justify={"center"}
              align="center"
              bg="black"
              fontWeight="extrabold"
              rounded="full"
              fontSize={{ base: "2xl", lg: "3xl" }}
              h={{ base: 12, lg: 14 }}
              p={4}
              className={partnerItemClassName}
              pointerEvents={"none"}
              userSelect={"none"}
            >
              <Text as="span" mb={1}>
                {partner.promo_label}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default PartnerSectionWithPhysics;
