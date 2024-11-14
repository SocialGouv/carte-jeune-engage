import { Flex, Icon, Text } from "@chakra-ui/react";
import { Offer } from "~/payload/payload-types";
import { BarcodeIcon } from "../icons/barcode";
import { HiMiniTag } from "react-icons/hi2";

const OfferKindBadge = ({
  source,
  kind,
}: {
  source: Offer["source"];
  kind: string;
}) => {
  return (
    <Flex
      alignItems="center"
      bgColor="bgGray"
      borderRadius="full"
      px={2}
      py={0.5}
    >
      {source === "obiz" ? (
        <BarcodeIcon w={4} h={4} />
      ) : (
        <Icon
          as={kind.startsWith("code") ? HiMiniTag : HiMiniTag}
          w={4}
          h={4}
        />
      )}
      <Text
        color="blackLight"
        fontSize={12}
        fontWeight={600}
        ml={1}
        textTransform="capitalize"
      >
        {source === "obiz"
          ? "Bon d'achat"
          : kind.startsWith("code")
            ? "Code"
            : "En magasin"}
      </Text>
    </Flex>
  );
};

export default OfferKindBadge;
