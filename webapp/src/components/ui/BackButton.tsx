import { Icon, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { TbChevronLeft, TbX } from "react-icons/tb";

type BackButtonProps = {
  variant?: "ghost";
  onClick?: () => void;
  close?: boolean;
};

const BackButton = (props: BackButtonProps) => {
  const router = useRouter();
  const { variant, onClick, close } = props;

  return (
    <IconButton
      alignSelf="start"
      shadow={variant === "ghost" ? "none" : "default"}
      variant={variant ? variant : "default"}
      flexShrink={0}
      aria-label="Retour"
      colorScheme="whiteBtn"
      bgColor="white"
      onClick={onClick ? onClick : () => router.back()}
      borderRadius="2.25xl"
      size="md"
      icon={<Icon as={close ? TbX : TbChevronLeft} w={6} h={6} color="black" />}
    />
  );
};

export default BackButton;
