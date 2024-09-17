import React from "react";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

type SearchBarProps = {
  search: string;
  setSearch: (search: string) => void;
};

export default function SearchBar({ search, setSearch }: SearchBarProps) {
  return (
    <InputGroup
      background={"cje-gray.500"}
      borderRadius={"1.125rem"}
      padding={"1rem 0.5rem"}
    >
      <InputLeftElement
        pointerEvents="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="full"
        pl={5}
        mt={0.5}
      >
        <CgSearch size={20} />
      </InputLeftElement>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="unstyled"
        ml={1}
        placeholder="Rechercher une marque"
      />
    </InputGroup>
  );
}
