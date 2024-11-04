import { Box, Button, Flex } from "@chakra-ui/react";
import { useState } from "react";
import DiscountAmountBlock from "~/components/obiz/DiscountAmountBlock";
import BackButton from "~/components/ui/BackButton";

export default function ObizOfferVariable() {
  const [amount, setAmount] = useState(0);

  return (
    <Flex flexDir="column" mt={10} px={8}>
      <BackButton />
      <Box mt={8}>
        <DiscountAmountBlock
          discount={5}
          amount={amount}
          setAmount={setAmount}
          minAmount={5}
          maxAmount={100}
        />
      </Box>
      <Button mt={10} onClick={() => setAmount(10)}>
        Acheter mon bon
      </Button>
    </Flex>
  );
}
