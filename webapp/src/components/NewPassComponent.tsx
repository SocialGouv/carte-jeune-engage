import { useAuth } from "~/providers/Auth";
import LoadingLoader from "./LoadingLoader";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  ChakraProps,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChangeEvent, ReactNode, useMemo, useState } from "react";
import {
  HiLockOpen,
  HiBuildingStorefront,
  HiUserCircle,
  HiUser,
  HiClock,
  HiShieldCheck,
  HiPhoto,
  HiCheckCircle,
  HiWrenchScrewdriver,
  HiFaceSmile,
  HiMiniCamera,
  HiMiniCheckCircle,
  HiXMark,
  HiChevronLeft,
} from "react-icons/hi2";
import StepsWrapper from "./wrappers/StepsWrapper";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "~/utils/cropImage";
import { PassIcon } from "./icons/pass";
import { api } from "~/utils/api";
import { Media } from "~/payload/payload-types";
import { getCookie } from "cookies-next";
import { push } from "@socialgouv/matomo-next";
import StackItems from "./offer/StackItems";
import _ from "lodash";

const WrappperNewPassComponent = ({
  children,
  modalOptions,
  hideCloseBtn,
}: {
  children: ReactNode;
  modalOptions: { isOpen: boolean; onClose: () => void };
  hideCloseBtn?: boolean;
}) => {
  const { isOpen, onClose } = modalOptions;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalBody pt={8}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

const UploadImageComponent = ({
  handleImageChange,
  text,
  textProps,
}: {
  text: string;
  textProps?: ChakraProps;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Center as="label" htmlFor="file-image-pass" w="full" h="full">
      <Text fontWeight={800} {...textProps}>
        {text}
      </Text>
      <input
        id="file-image-pass"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        hidden
      />
    </Center>
  );
};

const NewPassComponent = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, refetchUser } = useAuth();

  const { mutateAsync: updateUser } = api.user.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | undefined>(
    undefined
  );

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | undefined>(
    undefined
  );
  const [croppedImageFile, setCroppedImageFile] = useState<File | undefined>(
    undefined
  );

  const [isNewPassCompleted, setIsNewPassCompleted] = useState(false);
  const stepNewPass = useMemo(() => {
    if (isNewPassCompleted) return "completed";
    else if (croppedImageSrc) return "cropped";
  }, [croppedImageSrc, isNewPassCompleted]);

  const handleCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels || !user) return;
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0,
        user.id
      );
      if (croppedImage) {
        setCroppedImageFile(croppedImage);
        setCroppedImageSrc(URL.createObjectURL(croppedImage));
        setImageSrc(undefined);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    push(["trackEvent", "Carte", "Ajouter une photo"]);
    const file = e.target.files?.[0];
    if (file) {
      const tmpImageSrc = URL.createObjectURL(file);
      setImageSrc(tmpImageSrc);
    }
  };

  const handleCreatePass = async () => {
    if (!croppedImageFile) return;
    try {
      push(["trackEvent", "Carte", "Validation"]);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", croppedImageFile);
      formData.append("alt", "user-image");

      const jwtToken = getCookie(process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt");

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const result = (await response.json()) as { doc: Media };
        await updateUser({
          image: result.doc.id,
          status_image: "pending",
        });
        refetchUser();
        setIsNewPassCompleted(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleOnClose = () => {
    onClose();
    setIsNewPassCompleted(false);
    setCroppedImageSrc(undefined);
    setImageSrc(undefined);
  };

  if (!user || isLoading) {
    return (
      <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
        <Center h="full" mt={44}>
          <LoadingLoader />
        </Center>
      </WrappperNewPassComponent>
    );
  }

  if (stepNewPass === "completed") {
    return (
      <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
        <Icon
          as={HiXMark}
          h={8}
          w={8}
          mt={6}
          ml={2}
          color="blackLight"
          onClick={onClose}
        />
        <Center flexDir="column" textAlign="center" mt={24} px={16} gap={10}>
          <Image
            src={croppedImageSrc}
            w="118px"
            h="118px"
            borderRadius="full"
          />
          <Heading textAlign="center" fontWeight="extrabold" size="lg">
            Merci {_.capitalize(user.firstName as string)} !
          </Heading>
          <Text fontWeight={500}>
            Notre équipe vérifie votre photo et valide votre carte très
            rapidement.
          </Text>
          <Button w="fit-content" px={8} size="lg" onClick={handleOnClose}>
            Ok
          </Button>
        </Center>
      </WrappperNewPassComponent>
    );
  }

  if (stepNewPass === "cropped") {
    return (
      <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
        <Icon
          as={HiChevronLeft}
          h={8}
          w={8}
          mt={6}
          ml={2}
          color="blackLight"
          onClick={() => {
            setCroppedImageSrc(undefined);
            setCroppedAreaPixels(undefined);
          }}
        />
        <Center
          flexDir="column"
          position={imageSrc && !croppedImageSrc ? undefined : "relative"}
          mt={10}
          pb={12}
          textAlign="center"
          px={6}
        >
          <Image
            src={croppedImageSrc}
            w="230px"
            h="230px"
            borderRadius="full"
          />
          <Box mt={4}>
            <UploadImageComponent
              text="Changer de photo"
              textProps={{
                fontSize: 14,
                color: "disabled",
                textDecoration: "underline",
                textDecorationThickness: "2px",
              }}
              handleImageChange={(e) => {
                handleImageChange(e);
                setCroppedImageSrc(undefined);
              }}
            />
          </Box>
          <Heading size="xl" fontWeight={800} mt={8}>
            On voit votre visage en entier ?
          </Heading>
          <ButtonGroup flexDir="column" mt={12}>
            <Button
              size="lg"
              fontWeight={800}
              colorScheme="primaryShades"
              onClick={handleCreatePass}
            >
              Oui 👍
            </Button>
            <Box mt={5}>
              <UploadImageComponent
                text="Si non, changer de photo"
                textProps={{
                  color: "disabled",
                  textDecoration: "underline",
                  textDecorationThickness: "2px",
                }}
                handleImageChange={(e) => {
                  handleImageChange(e);
                  setCroppedImageSrc(undefined);
                }}
              />
            </Box>
          </ButtonGroup>
        </Center>
      </WrappperNewPassComponent>
    );
  }

  return (
    <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
      <Icon
        as={HiXMark}
        h={8}
        w={8}
        mt={6}
        ml={2}
        color="blackLight"
        onClick={onClose}
      />
      <Flex
        flexDir="column"
        position={imageSrc && !croppedImageSrc ? undefined : "relative"}
        mt={8}
        textAlign="center"
        px={6}
      >
        <Heading fontWeight="extrabold" size="xl">
          Ajouter ma photo
        </Heading>
        <Text fontWeight="medium" mt={2}>
          Votre photo est obligatoire pour les offres suivantes :
        </Text>
        <Flex
          flexDir="column"
          mt={8}
          gap={2}
          justifyContent="center"
          alignItems="center"
          w="200px"
          h="200px"
          mx="auto"
          bgColor="bgGray"
          borderRadius="full"
          style={{
            backgroundImage: `url(
              "data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='200' ry='200' stroke='%23000000FF' stroke-width='3' stroke-dasharray='8.25%25' stroke-dashoffset='100' stroke-linecap='butt'/%3e%3c/svg%3e"
            )`,
          }}
        >
          {!imageSrc && !croppedImageSrc ? (
            <Center flexDir="column" p={12}>
              <Icon as={HiMiniCamera} w={6} h={6} mb={2} />
              <UploadImageComponent
                text="Ajouter ma photo"
                handleImageChange={(e) => handleImageChange(e)}
              />
            </Center>
          ) : (
            <Box zIndex={1000}>
              <Cropper
                style={{
                  containerStyle: {
                    backgroundColor: "black",
                  },
                }}
                showGrid={false}
                cropShape="round"
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1}
                onCropChange={setCrop}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
                onZoomChange={setZoom}
              />
              <Button
                size="lg"
                position="absolute"
                left={8}
                bottom={8}
                onClick={() => {
                  setImageSrc(undefined);
                  setCroppedImageSrc(undefined);
                }}
              >
                Annuler
              </Button>
              <Button
                size="lg"
                position="absolute"
                right={8}
                bottom={8}
                onClick={handleCroppedImage}
              >
                Valider
              </Button>
            </Box>
          )}
        </Flex>
        {!imageSrc && !croppedImageSrc && (
          <Flex mt={14} justifyContent="center">
            <StackItems
              props={{ gap: 2 }}
              items={[
                { icon: HiMiniCheckCircle, text: "On voit bien votre visage" },
                {
                  icon: HiMiniCheckCircle,
                  text: "Il n’y a que vous sur la photo",
                },
              ]}
            />
          </Flex>
        )}
      </Flex>
    </WrappperNewPassComponent>
  );
};

export default NewPassComponent;
