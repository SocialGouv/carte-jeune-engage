import { Icon, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IconType } from "react-icons/lib";
import { TbChevronLeft } from "react-icons/tb";

type BackButtonProps = {
  variant?: "ghost";
  onClick?: () => void;
  icon?: IconType;
};

const BackButton = (props: BackButtonProps) => {
  const router = useRouter();
  const { variant, onClick, icon } = props;

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
      icon={<Icon as={icon ? icon : TbChevronLeft} w={6} h={6} color="black" />}
    />
  );
};

export default BackButton;
