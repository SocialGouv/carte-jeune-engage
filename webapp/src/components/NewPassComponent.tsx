import { useAuth } from "~/providers/Auth";
import LoadingLoader from "./LoadingLoader";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChangeEvent, ReactNode, useState } from "react";
import {
  HiLockOpen,
  HiBuildingStorefront,
  HiUserCircle,
  HiUser,
  HiClock,
  HiShieldCheck,
  HiCheck,
  HiPhoto,
  HiXMark,
  HiCheckCircle,
  HiWrenchScrewdriver,
} from "react-icons/hi2";
import StepsWrapper from "./wrappers/StepsWrapper";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "~/utils/cropImage";
import { set } from "zod";
import { PassIcon } from "./icons/pass";
import { api } from "~/utils/api";
import update from "payload/dist/collections/operations/update";
import { Media } from "~/payload/payload-types";
import { getCookie } from "cookies-next";

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
      <ModalOverlay bgColor="bgWhite" />
      <ModalContent h="full" boxShadow="none">
        {!hideCloseBtn && <ModalCloseButton left={6} top={8} />}
        <ModalBody pt={8} h="full" bgColor="bgWhite">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const UploadImageComponent = ({
  handleImageChange,
  text,
}: {
  text: string;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label htmlFor="file-image-pass">
      <Text fontWeight="bold" fontSize="lg" textDecor="underline">
        {text}
      </Text>
      <input
        id="file-image-pass"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        hidden
      />
    </label>
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
  const [stepNewPass, setStepNewPass] = useState<"add-photo" | "completed">();

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
    const file = e.target.files?.[0];
    if (file) {
      const tmpImageSrc = URL.createObjectURL(file);
      setImageSrc(tmpImageSrc);
    }
  };

  const handleCreatePass = async () => {
    if (!croppedImageFile) return;
    try {
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
        });
        refetchUser();
        setStepNewPass("completed");
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleOnClose = () => {
    onClose();
    setStepNewPass(undefined);
  };

  if (!user || isLoading) {
    return (
      <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
        <Center h="full">
          <LoadingLoader />
        </Center>
      </WrappperNewPassComponent>
    );
  }

  if (stepNewPass === "completed") {
    return (
      <WrappperNewPassComponent
        modalOptions={{ isOpen, onClose }}
        hideCloseBtn={true}
      >
        <Flex flexDir="column" justifyContent="end" h="full" pb={12} px={5}>
          <Flex alignItems="center" alignSelf="center">
            <Flex bgColor="blackLight" py={1.5} px={2.5} borderRadius="lg">
              <PassIcon color="cje-gray.500" />
            </Flex>
            <Flex bgColor="cje-gray.500" borderRadius="full" p={2.5} ml={-1}>
              <Icon as={HiWrenchScrewdriver} w={6} h={6} />
            </Flex>
          </Flex>
          <Heading textAlign="center" fontWeight="extrabold" size="lg" mt={20}>
            Notre équipe est en train de créer votre carte CJE {user.firstName}
          </Heading>
          <VStack spacing={4} mt={10}>
            <HStack spacing={4} w="full">
              <Icon as={HiClock} w={6} h={6} />
              <Text fontWeight="medium">Votre photo est vérifiée en 24h</Text>
            </HStack>
            <HStack spacing={4} w="full">
              <Icon as={HiCheckCircle} w={6} h={6} />
              <Text fontWeight="medium">
                Dès que votre carte est prête vous recevez un message
              </Text>
            </HStack>
            <HStack spacing={4} w="full">
              <Icon as={HiBuildingStorefront} w={6} h={6} />
              <Text fontWeight="medium">
                Dès demain vous pourrez bénéficier des offres en magasin
              </Text>
            </HStack>
          </VStack>
          <Button size="lg" mt={10} onClick={handleOnClose}>
            Ok
          </Button>
        </Flex>
      </WrappperNewPassComponent>
    );
  }

  if (stepNewPass === "add-photo") {
    return (
      <WrappperNewPassComponent
        modalOptions={{ isOpen, onClose }}
        hideCloseBtn={true}
      >
        <StepsWrapper
          stepContext={{ current: croppedImageSrc ? 2 : 1, total: 2 }}
          onBack={() => setStepNewPass(undefined)}
        >
          <Flex
            flexDir="column"
            position={imageSrc && !croppedImageSrc ? undefined : "relative"}
            pb={12}
            h="full"
          >
            <Heading fontWeight="extrabold" size="lg">
              Souriez c’est pour vos réductions en magasin !
            </Heading>
            <Flex
              flexDir="column"
              mt={8}
              gap={2}
              justifyContent="center"
              alignItems="center"
              w="212px"
              h="212px"
              mx="auto"
              bgColor="#ffffff"
              borderRadius="full"
            >
              {!imageSrc && !croppedImageSrc ? (
                <>
                  <Icon as={HiPhoto} w={8} h={8} />
                  <UploadImageComponent
                    text="Ajouter une photo"
                    handleImageChange={(e) => handleImageChange(e)}
                  />
                </>
              ) : !croppedImageSrc ? (
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
              ) : (
                <Image
                  src={croppedImageSrc}
                  w="212px"
                  h="212px"
                  borderRadius="full"
                />
              )}
            </Flex>
            {croppedImageSrc && (
              <Flex justifyContent="center" mt={2}>
                <UploadImageComponent
                  text="Changer de photo"
                  handleImageChange={(e) => {
                    handleImageChange(e);
                    setCroppedImageSrc(undefined);
                  }}
                />
              </Flex>
            )}
            <Box mt="auto">
              <VStack spacing={2} mt={12}>
                <HStack spacing={2} w="full">
                  <Icon as={HiCheck} w={5} h={5} />
                  <Text fontWeight="medium" fontSize="sm">
                    On voit bien votre visage
                  </Text>
                </HStack>
                <HStack spacing={2} w="full">
                  <Icon as={HiCheck} w={5} h={5} />
                  <Text fontWeight="medium" fontSize="sm">
                    La photo est suffisamment récente
                  </Text>
                </HStack>
                <HStack spacing={2} w="full">
                  <Icon as={HiCheck} w={5} h={5} />
                  <Text fontWeight="medium" fontSize="sm">
                    Ce n’est pas une photo de votre chat
                  </Text>
                </HStack>
                <HStack spacing={2} w="full">
                  <Icon as={HiCheck} w={5} h={5} />
                  <Text fontWeight="medium" fontSize="sm">
                    Même sans sourire ce n’est pas grave
                  </Text>
                </HStack>
              </VStack>
              <Button
                size="lg"
                w="full"
                mt={8}
                py={8}
                isDisabled={!croppedImageSrc}
                onClick={handleCreatePass}
              >
                Créer mon carte CJE
              </Button>
            </Box>
          </Flex>
        </StepsWrapper>
      </WrappperNewPassComponent>
    );
  }

  return (
    <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
      <Flex flexDir="column" px={2} py={8}>
        <Icon as={HiLockOpen} w={10} h={10} mx="auto" />
        <Image src="/images/new-pass-partners.png" alt="new-pass" />
        <Heading textAlign="center" fontWeight="extrabold" size="lg" mt={8}>
          Les économies en magasin
          <br />
          c'est possible :
          <br />
          <Box mt={2}>avec votre carte CJE</Box>
        </Heading>
        <Image
          mt={6}
          mx="auto"
          src="/images/new-pass-example.png"
          alt="new-pass"
        />
        <VStack spacing={6} mt={4}>
          <HStack spacing={4} w="full">
            <Icon as={HiBuildingStorefront} w={6} h={6} />
            <Text fontWeight="medium">
              La carte CJE permet d’obtenir les réductions dans tous les
              magasins disponibles sur l’appli
            </Text>
          </HStack>
          <HStack spacing={4} w="full">
            <Icon as={HiUser} w={6} h={6} />
            <Text fontWeight="medium">
              La carte CJE est virtuelle et gratuit
            </Text>
          </HStack>
          <HStack spacing={4} w="full">
            <Icon as={HiClock} w={6} h={6} />
            <Text fontWeight="medium">
              Nous vous créons votre carte CJE en 24h
            </Text>
          </HStack>
          <HStack spacing={4} w="full">
            <Icon as={HiUserCircle} w={6} h={6} />
            <Text fontWeight="medium">
              Présentez votre carte CJE au moment du paiement pour bénéficier de
              la réduction
            </Text>
          </HStack>
          <HStack spacing={4} w="full">
            <Icon as={HiUser} w={6} h={6} />
            <Text fontWeight="medium">
              Une photo de vous est nécessaire pour valider la carte
            </Text>
          </HStack>
          <HStack spacing={4} w="full">
            <Icon as={HiShieldCheck} w={6} h={6} />
            <Text fontWeight="medium">
              La photo sert au magasin pour vous reconnaître et vous offrir les
              réductions
            </Text>
          </HStack>
        </VStack>
        <Button
          size="lg"
          py={8}
          mt={8}
          onClick={() => setStepNewPass("add-photo")}
        >
          <Box lineHeight="short">
            Créer ma carte CJE
            <br />
            <Text fontSize="sm" color="cje-gray.200">
              juste votre photo à ajouter
            </Text>
          </Box>
        </Button>
      </Flex>
    </WrappperNewPassComponent>
  );
};

export default NewPassComponent;
