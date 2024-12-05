import { Icon, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    console.log("window.history.length", window.history);
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (canGoBack) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <IconButton
      alignSelf="start"
      shadow={variant === "ghost" ? "none" : "default"}
      variant={variant ? variant : "default"}
      flexShrink={0}
      aria-label="Retour"
      colorScheme="whiteBtn"
      bgColor="white"
      onClick={handleBack}
      borderRadius="2.25xl"
      size="md"
      icon={<Icon as={icon ? icon : TbChevronLeft} w={6} h={6} color="black" />}
    />
  );
};

export default BackButton;
