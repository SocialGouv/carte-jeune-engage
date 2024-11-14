import { Flex } from "@chakra-ui/react";
import { PartnerIncluded } from "~/server/api/routers/partner";
import Image from "./Image";

const PartnerImage = ({
  partner,
  width,
  height,
}: {
  partner: PartnerIncluded;
  width: number;
  height: number;
}) => {
  return (
    <Flex
      alignItems="center"
      borderRadius={width <= 40 ? "2xl" : "2.5xl"}
      border="1px solid"
      borderColor="bgGray"
      p={0.5}
      bg="white"
      overflow="hidden"
      zIndex={1}
      height={`${height}px`}
      width={`${width}px`}
    >
      <Image
        src={partner.icon.url as string}
        alt={partner.icon.alt as string}
        width={partner.icon.width || width}
        height={partner.icon.height || height}
        imageStyle={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: "20px",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </Flex>
  );
};

export default PartnerImage;
