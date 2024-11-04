import {
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

const DiscountAmountBlock = ({
  amount,
  setAmount,
  minAmount,
  maxAmount,
  discount,
}: {
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  minAmount: number;
  maxAmount: number;
  discount: number;
}) => {
  const isDisabled = amount === 0;
  const isInvalid =
    !isDisabled &&
    (amount < minAmount || amount > maxAmount || amount % 1 !== 0);

  return (
    <Center flexDir="column">
      <Flex display="flex" flexDir="column" alignItems="center" mx={10}>
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
          onChange={(e) =>
            setAmount(e.target.value ? Number(e.target.value) : 0)
          }
          placeholder="0€"
          min={minAmount}
          max={maxAmount}
        />
      </Flex>
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
    </Center>
  );
};

export default DiscountAmountBlock;
