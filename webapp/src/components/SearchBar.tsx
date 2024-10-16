import React, { useRef } from "react";
import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  ChakraProps,
  InputProps,
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";
import { HiMiniXCircle } from "react-icons/hi2";

type SearchBarProps = {
  search: string;
  setSearch: (search: string) => void;
  inputProps?: ChakraProps & InputProps;
  blurOnScroll?: boolean;
  small?: boolean;
  placeholder?: string;
};

export default function SearchBar({
  search,
  setSearch,
  inputProps,
  blurOnScroll = true,
  small = false,
  placeholder,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onTouchMove = () => inputRef.current?.blur();

  return (
    <InputGroup
      alignItems="center"
      background={"cje-gray.500"}
      borderRadius={"1.125rem"}
      padding={small ? "0.6rem 0.5rem" : "1rem 0.5rem"}
    >
      <InputLeftElement
        pointerEvents="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="full"
        pl={small ? 2 : 5}
        mt={small ? 0 : 0.5}
      >
        <CgSearch size={20} />
      </InputLeftElement>
      <Input
        {...inputProps}
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() =>
          blurOnScroll && document.addEventListener("touchmove", onTouchMove)
        }
        onBlur={() =>
          blurOnScroll && document.removeEventListener("touchmove", onTouchMove)
        }
        variant="unstyled"
        ml={1}
        placeholder={placeholder ?? "Rechercher une marque"}
      />
      {search && (
        <Icon
          as={HiMiniXCircle}
          w={5}
          h={5}
          mt={1}
          mr={2}
          onClick={() => {
            setSearch("");
            if (blurOnScroll) inputRef.current?.focus();
          }}
        />
      )}
    </InputGroup>
  );
}
