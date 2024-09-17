import { Box, Flex, Icon, IconButton } from "@chakra-ui/react";
import SearchBar from "../SearchBar";
import { HiChevronLeft } from "react-icons/hi2";
import { useRouter } from "next/router";

type SearchWrapperProps = {
  children: React.ReactNode;
};

const SearchWrapper = ({ children }: SearchWrapperProps) => {
  const router = useRouter();

  return (
    <Box pt={12} pb={32} minH="full">
      <Flex
        alignItems="center"
        gap={4}
        px={8}
        pb={4}
        borderBottomWidth={1}
        borderBottomColor="cje-gray.400"
        mb={6}
      >
        <IconButton
          variant="unstyled"
          mt={1}
          icon={<Icon as={HiChevronLeft} w={6} h={6} />}
          aria-label="Retour à l'accueil"
          onClick={() => router.push("/dashboard")}
        />
        <SearchBar />
      </Flex>
      {children}
    </Box>
  );
};

export default SearchWrapper;
