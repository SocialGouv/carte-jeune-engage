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
  HiPhoto,
  HiCheckCircle,
  HiWrenchScrewdriver,
  HiFaceSmile,
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
    <Center
      as="label"
      htmlFor="file-image-pass"
      pos="absolute"
      w="full"
      h="full"
      mt={8}
    >
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
  const [stepNewPass, setStepNewPass] = useState<"completed">();

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
      <WrappperNewPassComponent
        modalOptions={{ isOpen, onClose }}
        hideCloseBtn={true}
      >
        <Center h="full">
          <LoadingLoader />
        </Center>
      </WrappperNewPassComponent>
    );
  }

  if (stepNewPass === "completed") {
    return (
      <WrappperNewPassComponent modalOptions={{ isOpen, onClose }}>
        <Flex flexDir="column" justifyContent="end" h="full" pb={12}>
          <Flex alignItems="center" alignSelf="center">
            <Flex bgColor="blackLight" py={1.5} px={2.5} borderRadius="lg">
              <PassIcon color="cje-gray.500" />
            </Flex>
            <Flex bgColor="cje-gray.500" borderRadius="full" p={2.5} ml={-1}>
              <Icon as={HiWrenchScrewdriver} w={6} h={6} />
            </Flex>
          </Flex>
          <Heading textAlign="center" fontWeight="extrabold" size="lg" mt={20}>
            Notre équipe
            <br />
            vérifie votre photo {user.firstName}
          </Heading>
          <StackItems
            props={{ mt: 8 }}
            items={[
              {
                icon: HiCheckCircle,
                text: "Si votre visage est bien visible, c’est validé",
              },
              {
                icon: HiClock,
                text: "Votre photo est vérifiée en 24h",
              },
              {
                icon: HiBuildingStorefront,
                text: "Vous pourrez présenter votre carte en caisse pour les offres en magasin",
              },
            ]}
          />
          <Button size="lg" mt={16} onClick={handleOnClose}>
            Ok
          </Button>
        </Flex>
      </WrappperNewPassComponent>
    );
  }

  return (
    <WrappperNewPassComponent
      modalOptions={{ isOpen, onClose }}
      hideCloseBtn={true}
    >
      <StepsWrapper
        stepContext={{ current: croppedImageSrc ? 2 : 1, total: 2 }}
        onBack={() => {
          setImageSrc(undefined);
          setCroppedImageSrc(undefined);
          onClose();
        }}
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
            pos={imageSrc && !croppedImageSrc ? undefined : "relative"}
          >
            {!imageSrc && !croppedImageSrc ? (
              <>
                <Icon as={HiPhoto} w={8} h={8} mb={8} />
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
            <Flex justifyContent="center" pos="relative">
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
            <StackItems
              props={{ gap: 4 }}
              items={[
                { icon: HiFaceSmile, text: "Votre visage doit être visible" },
                {
                  icon: HiShieldCheck,
                  text: "Cette photo sert à prouver que vous avez le dorit à la carte CJE, personne ne peut la voir",
                },
              ]}
            />
            <Button
              size="lg"
              w="full"
              mt={8}
              py={8}
              isDisabled={!croppedImageSrc}
              onClick={handleCreatePass}
            >
              Créer ma carte CJE
            </Button>
          </Box>
        </Flex>
      </StepsWrapper>
    </WrappperNewPassComponent>
  );
};

export default NewPassComponent;
