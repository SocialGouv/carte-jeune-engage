import {
  Box,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import { HiMiniMinus, HiMiniPlus } from "react-icons/hi2";
import { OfferArticle } from "~/server/types";

type DefaultProps = {
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
};

interface DiscountAmountBlockVariable extends DefaultProps {
  kind: "variable_price";
  minAmount: number;
  maxAmount: number;
  discount: number;
}

interface DiscountAmountBlockFixed extends DefaultProps {
  kind: "fixed_price";
  articles: OfferArticle[];
  selectedArticles: { article: OfferArticle; quantity: number }[];
  setSelectedArticles: Dispatch<
    SetStateAction<{ article: OfferArticle; quantity: number }[]>
  >;
}

type DiscountAmountBlockProps =
  | DiscountAmountBlockVariable
  | DiscountAmountBlockFixed;

const DiscountAmountBlock = (props: DiscountAmountBlockProps) => {
  const { kind, amount, setAmount } = props;

  const discount =
    kind === "variable_price"
      ? props.discount
      : props.articles[0].reductionPercentage;
  const isDisabled = amount === 0;
  const isInvalid =
    kind === "variable_price" &&
    !isDisabled &&
    (amount < props.minAmount || amount > props.maxAmount || amount % 1 !== 0);

  return (
    <Center flexDir="column">
      <FormControl display="flex" flexDir="column" alignItems="center" mx={10}>
        <FormLabel
          textAlign="center"
          color="disabled"
          mx={0}
          mb={3}
          fontSize={14}
          fontWeight={500}
        >
          Choisissez le montant du bon
        </FormLabel>
        <Input
          type="number"
          variant="unstyled"
          bgColor={isInvalid ? "errorLight" : "bgGray"}
          borderRadius="2.5xl"
          fontWeight={800}
          textAlign="center"
          fontSize="52px"
          w="200px"
          py={6}
          autoComplete="off"
          step={1}
          autoFocus={kind === "variable_price"}
          value={kind === "fixed_price" ? amount : undefined}
          onChange={(e) =>
            setAmount(e.target.value ? Number(e.target.value) : 0)
          }
          placeholder="0€"
          min={kind === "variable_price" ? props.minAmount : 0}
          max={kind === "variable_price" ? props.maxAmount : 0}
          isDisabled={kind === "fixed_price"}
          _disabled={{ opacity: 1 }}
        />
      </FormControl>
      <Flex alignItems="center" mt={6}>
        <Center flexDir="column">
          <Text fontSize={14} fontWeight={500}>
            Vous payez
          </Text>
          <Flex alignItems="center" gap={2}>
            {!isDisabled && (
              <Text
                fontSize={18}
                fontWeight={500}
                textDecoration="line-through"
                textDecorationThickness="2px"
                color="disabled"
              >
                {amount}€
              </Text>
            )}
            <Text
              fontSize={24}
              fontWeight={800}
              opacity={isDisabled ? 0.25 : 1}
            >
              {(amount - amount * (discount / 100))
                .toFixed(isDisabled ? 0 : 2)
                .replace(".", ",")}
              €
            </Text>
          </Flex>
        </Center>
        <Divider orientation="vertical" h="50px" mx={6} />
        <Center flexDir="column">
          <Text fontSize={14} fontWeight={500}>
            Vous économisez
          </Text>
          <Text
            bgColor={isDisabled ? "black" : "primaryShades.100"}
            color={isDisabled ? "white" : "primary"}
            borderRadius="2xl"
            px={2}
            fontSize={24}
            fontWeight={800}
            opacity={isDisabled ? 0.25 : 1}
          >
            {(amount * (discount / 100))
              .toFixed(isDisabled ? 0 : 2)
              .replace(".", ",")}
            €
          </Text>
        </Center>
      </Flex>
      {kind === "fixed_price" && (
        <Box mt={8} w="full">
          {props.articles.map((article, index) => {
            const selectedArticle = props.selectedArticles.find(
              (a) => a.article.reference === article.reference
            );
            const quantity = selectedArticle?.quantity || 0;
            return (
              <Flex key={article.reference} flexDir="column" w="full">
                {index === 0 && <Divider borderColor="cje-gray.100" />}
                <Flex alignItems="center" mt={2}>
                  <Flex flexDir="column">
                    <Text fontWeight={500}>Bon de {article.publicPrice}€</Text>
                    <Text fontSize={14} color="disabled">
                      Valable jusqu'au{" "}
                      {new Date(article.validityTo).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Text>
                    <Text fontSize={14} fontWeight={700}>
                      Voir les infos
                    </Text>
                  </Flex>
                  <Flex alignItems="center" ml="auto" gap={2}>
                    <IconButton
                      icon={<Icon as={HiMiniMinus} />}
                      borderRadius="full"
                      size="xs"
                      aria-label={`Minus the quantity of ${article.reference}`}
                      isDisabled={quantity === 0}
                      onClick={() => {
                        if (quantity === 0) return;
                        props.setSelectedArticles((prev) =>
                          prev.map((a) =>
                            a.article.reference === article.reference
                              ? { ...a, quantity: a.quantity - 1 }
                              : a
                          )
                        );
                        setAmount(
                          (prev) => prev - (article.publicPrice as number)
                        );
                      }}
                    />
                    <Box bgColor="bgGray" borderRadius="xl" py={2} px={6}>
                      <Text fontSize={18} fontWeight={800}>
                        {quantity}
                      </Text>
                    </Box>
                    <IconButton
                      size="xs"
                      aria-label={`Plus the quantity of ${article.reference}`}
                      icon={<Icon as={HiMiniPlus} />}
                      borderRadius="full"
                      isDisabled={quantity === 5}
                      onClick={() => {
                        if (quantity === 5) return;
                        props.setSelectedArticles((prev) => [
                          ...prev.filter(
                            (a) => a.article.reference !== article.reference
                          ),
                          {
                            article,
                            quantity: quantity + 1,
                          },
                        ]);
                        setAmount(
                          (prev) => prev + (article.publicPrice as number)
                        );
                      }}
                    />
                  </Flex>
                </Flex>
                <Divider borderColor="cje-gray.100" mt={2} />
              </Flex>
            );
          })}
        </Box>
      )}
    </Center>
  );
};

export default DiscountAmountBlock;
