import { Divider, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "../ui/Image";
import { OfferIncluded } from "~/server/api/routers/offer";

type RecapOrderProps = {
  amount: number;
  discount: number;
  offer: OfferIncluded;
};

const RecapOrder = ({ amount, discount, offer }: RecapOrderProps) => {
  const amountWithDiscount = amount - (amount * discount) / 100;
  const discountAmount = amount - amountWithDiscount;

  const formatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Flex flexDir="column">
      <Heading size="xl" fontWeight={800}>
        Récapitulatif
      </Heading>
      <Flex alignItems="center" gap={2} mt={4}>
        <Image
          src={offer.partner.icon.url as string}
          alt={offer.partner.icon.alt as string}
          width={50}
          height={50}
        />
        <Flex flexDir="column">
          <Text fontSize={14} fontWeight={500}>
            {offer.partner.name}
          </Text>
          <Text
            fontSize={12}
            fontWeight={800}
          >{`${offer.title} ${offer.subtitle ?? ""}`}</Text>
        </Flex>
      </Flex>
      <Divider my={4} />
      <Flex alignItems="center">
        <Text fontWeight={500}>Valeur du bon</Text>
        <Text fontWeight={700} ml="auto">
          {formatter.format(amount)}€
        </Text>
      </Flex>
      <Divider borderStyle="dashed" my={4} />
      <Flex alignItems="center">
        <Text fontWeight={500}>Réduction de {discount}%</Text>
        <Text
          fontWeight={700}
          ml="auto"
          textDecoration="line-through"
          opacity={0.5}
        >
          {formatter.format(amount)}€
        </Text>
        <Text fontWeight={700} ml={2}>
          {formatter.format(amountWithDiscount)}€
        </Text>
      </Flex>
      <Flex alignItems="center" mt={2.5}>
        <Text fontWeight={500}>Vous économisez</Text>
        <Text fontWeight={700} ml="auto" color="primary">
          {formatter.format(discountAmount)}€
        </Text>
      </Flex>
      <Divider my={4} />
      <Flex alignItems="center" fontWeight={800}>
        <Text fontSize={18}>À payer</Text>
        <Text fontSize={18} ml="auto">
          {formatter.format(amountWithDiscount)}€
        </Text>
      </Flex>
      <Divider my={4} />
    </Flex>
  );
};

export default RecapOrder;
