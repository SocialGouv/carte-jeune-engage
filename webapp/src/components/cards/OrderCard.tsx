import { Box, Flex, Tag, Text, Image as ChakraImage } from "@chakra-ui/react";
import { OrderIncluded } from "~/server/api/routers/order";
import Image from "../ui/Image";
import { BarcodeIcon } from "../icons/barcode";
import ConditionalLink from "../ConditionalLink";
import { useMemo } from "react";
import { formatter2Digits } from "~/utils/tools";

type OrderCardProps = {
  order: OrderIncluded;
};

const OrderCard = (props: OrderCardProps) => {
  const { order } = props;

  const amount = useMemo(() => {
    return formatter2Digits.format(
      order.articles?.reduce((acc, curr) => {
        return acc + curr.article_montant * curr.article_quantity;
      }, 0) ?? 0
    );
  }, [order.articles]);

  return (
    <ConditionalLink
      to={`/dashboard/order/${order.id}`}
      condition
      props={{
        _hover: { textDecoration: "none" },
      }}
    >
      <Flex
        flexDir="column"
        px={4}
        pt={2}
        bg="white"
        borderRadius="2.5xl"
        shadow={"default-wallet"}
        h={"245px"}
        borderColor="cje-gray.400"
        overflow="hidden"
        gap={2}
      >
        {order.offer.partner.icon.url && (
          <Flex alignItems={"center"} gap={2}>
            <Box
              flexGrow={0}
              rounded={"2xl"}
              borderWidth={1}
              borderColor={"bgGray"}
              overflow={"hidden"}
            >
              <Image
                src={order.offer.partner.icon.url}
                alt={order.offer.partner.icon.alt || ""}
                width={40}
                height={40}
              />
            </Box>
            <Text fontWeight={700}>{order.offer.partner.name}</Text>
          </Flex>
        )}
        <Flex alignItems={"center"} gap={2}>
          <Tag fontWeight={700}>
            <BarcodeIcon mr={1} /> Bon d'achat
          </Tag>
          <Text fontWeight={700}>{amount} €</Text>
        </Flex>
        <Flex flexGrow={1}>
          <ChakraImage
            src={order.offer.image?.url || order.offer.partner.icon.url || ""}
            alt={`${order.offer.title} image`}
            mx="auto"
            h="full"
          />
        </Flex>
      </Flex>
    </ConditionalLink>
  );
};

export default OrderCard;
