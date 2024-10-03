import { Icon, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { TbChevronLeft } from "react-icons/tb";

type BackButtonProps = {
  onClick?: () => void;
};

const BackButton = (props: BackButtonProps) => {
  const router = useRouter();
  const { onClick } = props;

  return (
    <IconButton
      alignSelf="start"
      shadow="default"
      flexShrink={0}
      aria-label="Retour"
      colorScheme="whiteBtn"
      onClick={onClick ? onClick : () => router.back()}
      borderRadius="2.25xl"
      size="md"
      icon={<Icon as={TbChevronLeft} w={6} h={6} color="black" />}
    />
  );
};

export default BackButton;
