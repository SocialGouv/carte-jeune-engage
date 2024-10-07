import { Flex, Spinner } from "@chakra-ui/react";

const BigLoader = () => {
  return (
    <Flex h="100vh" w="100%" justifyContent={"center"} alignItems={"center"}>
      <Spinner
        thickness="5px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blackLight"
        boxSize={24}
      />
    </Flex>
  );
};

export default BigLoader;
