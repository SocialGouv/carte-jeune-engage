import {
  Checkbox,
  Collapse,
  Divider,
  Flex,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import Image from "../ui/Image";
import { OfferIncluded } from "~/server/api/routers/offer";
import { OfferArticle } from "~/server/types";
import { formatter2Digits } from "~/utils/tools";
import NextLink from "next/link";
import { Dispatch, SetStateAction, useState } from "react";

type RecapOrderDefaultProps = {
  amount: number;
  discount: number;
  offer: OfferIncluded;
  checkedCGV: boolean;
  setCheckedCGV: Dispatch<SetStateAction<boolean>>;
  formError?: string;
  setFormError: Dispatch<SetStateAction<string | undefined>>;
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
  const {
    kind,
    amount,
    discount,
    offer,
    checkedCGV,
    setCheckedCGV,
    formError,
    setFormError,
  } = props;
  const amountWithDiscount = amount - (amount * discount) / 100;
  const discountAmount = amount - amountWithDiscount;

  const [showCondition, setShowCondition] = useState(false);

  const handleCheckedCGV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setFormError(undefined);
    setCheckedCGV(e.target.checked);
  };

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
      <Flex flexDir="column" gap={2}>
        <Checkbox
          colorScheme="primaryShades"
          isChecked={checkedCGV}
          onChange={handleCheckedCGV}
        >
          <Text fontSize={14}>
            J'accepte les{" "}
            <Link as={NextLink} href="/">
              <Text
                as="span"
                color="primary"
                fontWeight={700}
                textDecor="underline"
                textUnderlineOffset={2}
                textDecorationThickness="2px"
              >
                CGV du partenaire
              </Text>
            </Link>
          </Text>
        </Checkbox>
        <Text fontSize={14} fontWeight={500}>
          Les bon d’achats ne sont ni repris ni échangés
        </Text>
        <Flex flexDir="column" gap={1}>
          <Collapse startingHeight={50} in={showCondition}>
            <Text fontSize={12} fontWeight={500} lineHeight="normal">
              En cliquant sur ce bouton, je certifie avoir vérifié toutes les
              informations de ma commande (adulte, enfant, date de validité,
              lieu, date et heure de séance, ville, etc.) et avoir conscience
              que, conformément à l’article L 221-28 du Code de la Consommation,
              les e-billets et billets achetés sur cette application (parcs,
              cinémas, concerts, spectacles, cartes cadeaux, forfaits de ski ou
              autre) ne sont ni modifiables, ni remboursables et ne font l’objet
              d’aucun droit de rétractation.
            </Text>
          </Collapse>
          <Text
            fontSize={12}
            fontWeight={700}
            cursor="pointer"
            textDecor="underline"
            textUnderlineOffset={2}
            textDecorationThickness="2px"
            onClick={() => setShowCondition(!showCondition)}
          >
            {showCondition ? "Voir moins" : "Tout lire"}
          </Text>
        </Flex>
        {formError && (
          <Text fontSize={14} color="error" fontWeight={700} mt={2}>
            {formError}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default RecapOrder;
