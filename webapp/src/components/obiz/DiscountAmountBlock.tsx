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
  Tooltip,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { HiMiniMinus, HiMiniPlus } from "react-icons/hi2";
import { useDebounceValue } from "usehooks-ts";
import { OfferArticle } from "~/server/types";
import ArticleDetailsModal from "../modals/ArticleDetailsModal";

type DiscountArticleBlockProps = {
  article: OfferArticle;
  index: number;
  selectedArticles: DiscountAmountBlockFixed["selectedArticles"];
  setSelectedArticles: DiscountAmountBlockFixed["setSelectedArticles"];
  setAmount: Dispatch<SetStateAction<number>>;
};

const DiscountArticleBlock = ({
  article,
  setAmount,
  selectedArticles,
  setSelectedArticles,
  index,
}: DiscountArticleBlockProps) => {
  const selectedArticle = selectedArticles.find(
    (a) => a.article.reference === article.reference
  );
  const quantity = selectedArticle?.quantity || 0;
  let [isMaximumQuantity, setIsMaximumQuantity] = useState(false);
  let ref = useRef(null);

  const {
    isOpen: isOpenDetailsModal,
    onOpen: onOpenDetailsModal,
    onClose: onCloseDetailsModal,
  } = useDisclosure();

  useOutsideClick({
    ref,
    handler: () => setIsMaximumQuantity(false),
  });

  return (
    <Flex key={article.reference} flexDir="column" w="full">
      {index === 0 && <Divider borderColor="cje-gray.100" />}
      <Flex alignItems="center" mt={2}>
        <Flex flexDir="column">
          <Text fontWeight={500}>Bon de {article.publicPrice}€</Text>
          <Text fontSize={14} color="disabled">
            Valable jusqu'au{" "}
            {new Date(article.validityTo).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
          <Text
            color={article.description ? "inherit" : "disabled"}
            textDecor={"underline"}
            fontSize={14}
            fontWeight={700}
            onClick={() => {
              onOpenDetailsModal();
            }}
          >
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
              setIsMaximumQuantity(false);
              setSelectedArticles((prev) =>
                prev.map((a) =>
                  a.article.reference === article.reference
                    ? { ...a, quantity: a.quantity - 1 }
                    : a
                )
              );
              setAmount((prev) => prev - (article.publicPrice as number));
            }}
          />
          <Box bgColor="bgGray" borderRadius="xl" py={2} px={6}>
            <Text fontSize={18} fontWeight={800}>
              {quantity}
            </Text>
          </Box>
          <Tooltip
            isOpen={quantity === 5 && isMaximumQuantity}
            label="Maximum"
            bg="error"
            borderRadius="2.5xl"
            hasArrow
            arrowSize={8}
            mt={2.5}
            placement="bottom-start"
          >
            <IconButton
              size="xs"
              aria-label={`Plus the quantity of ${article.reference}`}
              icon={<Icon as={HiMiniPlus} />}
              borderRadius="full"
              isDisabled={quantity === 5 && isMaximumQuantity}
              ref={ref}
              onClick={() => {
                if (quantity === 5) {
                  setIsMaximumQuantity(true);
                  return;
                }
                setSelectedArticles((prev) => [
                  ...prev.filter(
                    (a) => a.article.reference !== article.reference
                  ),
                  {
                    article,
                    quantity: quantity + 1,
                  },
                ]);
                setAmount((prev) => prev + (article.publicPrice as number));
              }}
            />
          </Tooltip>
        </Flex>
      </Flex>
      <Divider
        borderColor="cje-gray.100"
        mt={quantity === 5 && isMaximumQuantity ? 8 : 2}
      />
      {article.description && (
        <ArticleDetailsModal
          isOpen={isOpenDetailsModal}
          onClose={onCloseDetailsModal}
          article={article}
        />
      )}
    </Flex>
  );
};

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

  const [isInvalidDebounce] = useDebounceValue(isInvalid, 250);
  const [isDisabledDebounce] = useDebounceValue(isDisabled, 250);

  const tooltipText = useMemo(() => {
    if (kind === "variable_price" && isInvalid) {
      if (amount < props.minAmount)
        return `Le montant minimum est ${props.minAmount}€`;
      if (amount > props.maxAmount)
        return `Le montant maximum est ${props.maxAmount}€`;
      if (amount % 1 !== 0) return "Les centimes ne sont pas pris en compte.";
    }
    return "";
  }, [amount]);

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
        <Tooltip
          isOpen={kind === "variable_price" && isInvalidDebounce}
          placement="bottom"
          label={tooltipText}
          bgColor="error"
          hasArrow
          arrowSize={18}
          mt={-1}
          borderRadius="2xl"
        >
          <Input
            type="number"
            pattern="[0-9]*"
            variant="unstyled"
            bgColor={isInvalidDebounce ? "errorLight" : "bgGray"}
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
            onChange={(e) => {
              setAmount(e.target.value ? Number(e.target.value) : 0);
            }}
            placeholder="0€"
            min={kind === "variable_price" ? props.minAmount : 0}
            max={kind === "variable_price" ? props.maxAmount : 0}
            isDisabled={kind === "fixed_price"}
            _disabled={{ opacity: 1 }}
          />
        </Tooltip>
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
        <Tooltip
          isOpen={
            kind === "variable_price" &&
            !isDisabledDebounce &&
            !isInvalidDebounce
          }
          placement="bottom"
          label="Pas mal !"
          hasArrow
          arrowSize={18}
          borderRadius="2xl"
          ml={1.5}
          mt={1}
          transform="rotate(-5deg)!important"
        >
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
        </Tooltip>
      </Flex>
      {kind === "fixed_price" && (
        <Box mt={8} w="full">
          {props.articles.map((article, index) => (
            <DiscountArticleBlock
              key={article.reference}
              article={article}
              selectedArticles={props.selectedArticles}
              setSelectedArticles={props.setSelectedArticles}
              setAmount={setAmount}
              index={index}
            />
          ))}
        </Box>
      )}
    </Center>
  );
};

export default DiscountAmountBlock;
