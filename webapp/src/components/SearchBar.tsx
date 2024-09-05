import React from "react";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

export default function SearchBar() {
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
        height="100%"
        paddingLeft="20px"
      >
        <CgSearch size="2rem" />
      </InputLeftElement>
      <Input variant="unstyled" placeholder="Rechercher une marque" />
    </InputGroup>
  );
}
