import { Divider, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "../ui/Image";
import { OfferIncluded } from "~/server/api/routers/offer";
import { OfferArticle } from "~/server/types";
import { formatter2Digits } from "~/utils/tools";

type RecapOrderDefaultProps = {
  amount: number;
  discount: number;
  offer: OfferIncluded;
};

interface RecapOrderVariable extends RecapOrderDefaultProps {
  kind: "variable_price";
}

interface RecapOrderFixed extends RecapOrderDefaultProps {
  kind: "fixed_price";
  articles: { article: OfferArticle; quantity: number }[];
}

type RecapOrderProps = RecapOrderVariable | RecapOrderFixed;

const RecapOrder = (props: RecapOrderProps) => {
  const { kind, amount, discount, offer } = props;
  const amountWithDiscount = amount - (amount * discount) / 100;
  const discountAmount = amount - amountWithDiscount;

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
      {kind === "variable_price" ? (
        <Flex alignItems="center">
          <Text fontWeight={500}>Valeur du bon</Text>
          <Text fontWeight={700} ml="auto">
            {formatter2Digits.format(amount)}€
          </Text>
        </Flex>
      ) : (
        <Flex flexDir="column" gap={4}>
          {props.articles.map(({ article, quantity }) => (
            <Flex key={article.reference} alignItems="center">
              <Text fontWeight={500}>{`Bon de ${article.publicPrice}€`}</Text>
              <Text fontWeight={700} ml="auto">
                x{quantity}
              </Text>
            </Flex>
          ))}
          <Flex alignItems="center">
            <Text fontWeight={500}>Total valeur bon d'achat </Text>
            <Text fontWeight={700} ml="auto">
              {formatter2Digits.format(amount)}€
            </Text>
          </Flex>
        </Flex>
      )}
      <Divider borderStyle="dashed" my={4} />
      <Flex alignItems="center">
        <Text fontWeight={500}>Réduction de {discount}%</Text>
        <Text
          fontWeight={700}
          ml="auto"
          textDecoration="line-through"
          opacity={0.5}
        >
          {formatter2Digits.format(amount)}€
        </Text>
        <Text fontWeight={700} ml={2}>
          {formatter2Digits.format(amountWithDiscount)}€
        </Text>
      </Flex>
      <Flex alignItems="center" mt={2.5}>
        <Text fontWeight={500}>Vous économisez</Text>
        <Text fontWeight={700} ml="auto" color="primary">
          {formatter2Digits.format(discountAmount)}€
        </Text>
      </Flex>
      <Divider my={4} />
      <Flex alignItems="center" fontWeight={800}>
        <Text fontSize={18}>À payer</Text>
        <Text fontSize={18} ml="auto">
          {formatter2Digits.format(amountWithDiscount)}€
        </Text>
      </Flex>
      <Divider my={4} />
    </Flex>
  );
};

export default RecapOrder;
