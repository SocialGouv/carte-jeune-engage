import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  HiCheckCircle,
  HiClock,
  HiEnvelope,
  HiExclamationCircle,
  HiEye,
  HiMiniChatBubbleLeftEllipsis,
  HiMinus,
  HiPhone,
  HiPlus,
} from "react-icons/hi2";
import { MdOutlineFileDownload } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";
import { BarcodeIcon } from "~/components/icons/barcode";
import LoadingLoader from "~/components/LoadingLoader";
import LayoutOrderStatus from "~/components/obiz/LayoutOrderStatus";
import BackButton from "~/components/ui/BackButton";
import Image from "~/components/ui/Image";
import PartnerImage from "~/components/ui/PartnerImage";
import { Typewriter } from "~/components/ui/Typewriter";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import {
  formatDateToDDMMYYYY,
  formatter2Digits,
  isOlderThan24Hours,
} from "~/utils/tools";

export default function OrderObizPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { user } = useAuth();

  const { id } = router.query as {
    id: string;
  };

  const [showDetails, setShowDetails] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(true);

  const {
    isOpen: isOpenModalSignalIssue,
    onOpen: onOpenModalSignalIssue,
    onClose: onCloseModalSignalIssue,
  } = useDisclosure();

  const {
    data: resultOrder,
    isLoading: isLoadingOrder,
    isRefetching: isRefetchingOrder,
    error: errorOrder,
  } = api.order.getById.useQuery(
    { id: parseInt(id) },
    { enabled: id !== undefined }
  );
  const { mutateAsync: mutateOrderSync, isLoading: isLoadingSyncOrder } =
    api.order.synchronizeOrder.useMutation({
      onSuccess: () => {
        setIsSynchronizing(false);
        utils.order.getById.invalidate();
      },
    });

  const { data: order } = resultOrder || {};

  const { mutateAsync: mutateCreateSignal } =
    api.order.createSignal.useMutation({});

  const amount = useMemo(() => {
    return formatter2Digits.format(
      order?.articles?.reduce((acc, curr) => {
        return acc + curr.article_montant * curr.article_quantity;
      }, 0) ?? 0
    );
  }, [order?.articles]);

  useEffect(() => {
    if (order && order.status !== "delivered" && !isLoadingSyncOrder) {
      mutateOrderSync({ order_id: order.id });
    }
  }, [order?.status]);

  if (isLoadingOrder || !user || !router.isReady) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  if (!order || !order.articles || errorOrder?.data?.httpStatus === 403) {
    router.replace("/dashboard");
    return;
  }

  const orderHasIssue =
    !isSynchronizing &&
    order.status !== "delivered" &&
    isOlderThan24Hours(order.createdAt);

  const handlePDFActions = async (isShare: boolean) => {
    if (typeof order.ticket === "object" && order.ticket?.url) {
      try {
        const response = await fetch(
          `/api/image?filename=${order.ticket.filename}`
        );
        console.log(`/api/image?filename=${order.ticket.filename}`);
        const blob = await response.blob();
        const filename = `bon-${order.offer.partner.name}-${order.number}.pdf`;

        const file = new File([blob], filename, {
          type: response.headers.get("content-type") || "application/pdf",
        });

        if (
          isShare &&
          navigator.share &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
          });
        } else {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
      } catch (error) {
        console.error("Error sharing file:", error);
      }
    }
  };

  const signalIssueWithOrder = () => {
    mutateCreateSignal({
      id: order.id,
    });
    onOpenModalSignalIssue();
  };

  const getOrderContent = () => {
    if (!order.articles) return;

    if (orderHasIssue) {
      return (
        <Flex direction={"column"} gap={8} mx={4}>
          <Flex direction={"column"} gap={4} alignItems={"center"}>
            <Box color="error" fontSize={"4xl"} mb={2}>
              <HiExclamationCircle />
            </Box>
            <Text
              fontWeight={900}
              fontSize={"2xl"}
              textAlign={"center"}
              color="error"
            >
              Nous rencontrons un problème avec ce bon d’achat
            </Text>
            <Text
              fontWeight={500}
              fontSize={"sm"}
              textAlign={"center"}
              color="disabled"
            >
              Signalez votre problème maintenant pour obtenir de l’aide.
            </Text>
            <Button
              colorScheme="errorShades"
              mt={4}
              fontSize={"md"}
              px={8}
              onClick={signalIssueWithOrder}
            >
              Signaler mon problème
            </Button>
          </Flex>
          <Divider />
          <Flex gap={3}>
            <Box color="primary" fontSize={"lg"} pt={1}>
              <HiCheckCircle />
            </Box>
            <Text>Votre paiement a bien été enregistré</Text>
          </Flex>
          <Flex gap={3}>
            <Box color="error" fontSize={"lg"} pt={1}>
              <PiWarningFill />
            </Box>
            <Text>Votre bon d’achat n’est toujours pas arrivé</Text>
          </Flex>
        </Flex>
      );
    }

    if (order.status !== "delivered") {
      return (
        <Flex direction={"column"} gap={4} mx={4}>
          <Flex direction={"column"} gap={4} my={8} position={"relative"}>
            <Box w="236px" mx="auto">
              <Image
                src={"/images/dashboard/offer-pdf-pending.png"}
                alt={`En attente de PDF pour ${order.offer.partner.name}`}
                width={472}
                height={272}
              />
            </Box>
            <Flex
              w="full"
              position={"absolute"}
              top={"50%"}
              left={"50%"}
              transform={"translateX(-50%)translateY(-50%)"}
              color="disabled"
              fontWeight={900}
              fontSize="xl"
              textAlign={"center"}
            >
              <Text w="full">
                Vos bons <br /> arrivent bientôt
                <Typewriter text="..." />
              </Text>
            </Flex>
          </Flex>
          <Flex gap={3}>
            <Box color="primary" fontSize={"lg"} pt={1}>
              <HiCheckCircle />
            </Box>
            <Text>Votre paiement a bien été enregistré</Text>
          </Flex>
          <Flex gap={3}>
            <Box color="black" fontSize={"lg"} pt={1}>
              <HiClock />
            </Box>
            <Text>Les bons peuvent prendre 24h à être activés</Text>
          </Flex>
        </Flex>
      );
    }

    return (
      <>
        <Flex position={"relative"} my={8} h="218px">
          <Box w="180px">
            <Image
              src={"/images/dashboard/order-pdf.png"}
              alt={`Image d'un exemple PDF pour ${order.offer.partner.name}`}
              width={360}
              height={436}
            />
          </Box>
          <Box
            position={"absolute"}
            top={"40%"}
            left={"50%"}
            transform={"translateX(-50%)translateY(-50%)"}
          >
            <Image
              src={order.offer.partner.icon.url || ""}
              width={60}
              height={order.offer.partner.icon.height || 50}
              alt={`Logo ${order.offer.partner.name}`}
            />
          </Box>
        </Flex>
        <Flex justifyContent={"center"} gap={8} mt={8}>
          <Box textAlign={"center"}>
            <Button
              colorScheme="blackBtn"
              p={5}
              h="auto"
              onClick={() => {
                handlePDFActions(false);
              }}
            >
              <HiEye fontSize={24} />
            </Button>
            <Text fontWeight={900} fontSize="sm" mt={1}>
              Afficher
            </Text>
          </Box>
          <Box textAlign={"center"}>
            <Button
              colorScheme="blackBtn"
              flexGrow={0}
              p={5}
              h="auto"
              onClick={() => {
                handlePDFActions(true);
              }}
            >
              <MdOutlineFileDownload fontSize={24} />
            </Button>
            <Text fontWeight={900} fontSize="sm" mt={1}>
              Télécharger
            </Text>
          </Box>
        </Flex>
      </>
    );
  };

  return (
    <>
      <Flex
        minH="full"
        direction={"column"}
        position="relative"
        pt={16}
        pb={9}
        px={6}
        bg="bgGray"
      >
        <Flex direction={"column"} gap={10}>
          <BackButton onClick={() => router.push("/dashboard/wallet")} />
          <Flex
            alignItems={"center"}
            direction={"column"}
            px={4}
            rounded={"2xl"}
            gap={3}
            mx={4}
          >
            <Flex alignItems={"center"} gap={2}>
              <PartnerImage
                partner={order.offer.partner}
                width={52}
                height={52}
              />
              <Text fontWeight={700} fontSize={"xl"}>
                {order.offer.partner.name}
              </Text>
            </Flex>
            <Tag bg="white" fontWeight={700}>
              <BarcodeIcon mr={1} /> Bon d'achat
            </Tag>
          </Flex>
          <Flex
            direction={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            bg="white"
            rounded={"2xl"}
            shadow={"xl"}
            p={6}
          >
            {!orderHasIssue && (
              <>
                <Text>Valeur totale</Text>
                <Text fontWeight={900} fontSize="3xl" mt={2}>
                  {amount}€
                </Text>
              </>
            )}
            {getOrderContent()}
          </Flex>
          <Flex direction="column" bg="white" rounded={"2xl"} px={3} py={4}>
            <Flex justifyContent={"space-between"}>
              <Text fontWeight={900}>Valeur totale</Text>
              <Text fontWeight={700}>{amount}€</Text>
            </Flex>
            <Divider my={4} />
            <Flex
              justifyContent={"space-between"}
              onClick={() => setShowDetails(!showDetails)}
            >
              <Text textDecor={"underline"} fontWeight={700}>
                Voir le détail
              </Text>
              <Text fontSize={"2xl"}>
                {showDetails ? <HiMinus /> : <HiPlus />}
              </Text>
            </Flex>
            {showDetails && (
              <Flex direction={"column"} gap={1} fontSize={"sm"} mt={4}>
                {order.articles.map((article) => (
                  <>
                    <Flex justifyContent={"space-between"}>
                      <Text>Bon d'achat de {article.article_montant}€</Text>
                      <Text fontWeight={700}>x{article?.article_quantity}</Text>
                    </Flex>
                    <Divider borderStyle={"dashed"} />
                  </>
                ))}
                <Flex justifyContent={"space-between"}>
                  <Text>Total valeur bon d'achat</Text>
                  <Text fontWeight={700}>{amount}€</Text>
                </Flex>
              </Flex>
            )}
          </Flex>
          <Flex direction="column" rounded={"2xl"} px={2}>
            <Flex justifyContent={"space-between"}>
              <Text>Valable jusqu'au</Text>
              <Text color="disabled">Voir sur le PDF</Text>
            </Flex>
            <Divider my={4} />
            <Flex justifyContent={"space-between"}>
              <Text>Date de commande</Text>
              <Text>{formatDateToDDMMYYYY(order.createdAt)}</Text>
            </Flex>
            <Divider my={4} />
            <Text
              fontWeight={700}
              textDecor="underline"
              textDecorationThickness="2px"
              textUnderlineOffset={2}
            >
              Voir les conditions détaillées
            </Text>
            {order.status !== "delivered" && (
              <Flex
                mt={14}
                px={6}
                py={4}
                alignItems="center"
                bgColor="white"
                borderRadius="2.5xl"
                cursor="pointer"
                onClick={onOpenModalSignalIssue}
              >
                <Icon
                  as={HiMiniChatBubbleLeftEllipsis}
                  color="blackLight"
                  mr={4}
                  w={5}
                  h={5}
                  mb={-0.5}
                />
                <Text
                  fontWeight={700}
                  textDecor="underline"
                  textDecorationThickness="2px"
                  textUnderlineOffset={2}
                >
                  Besoin d’aide ?
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Modal
        isOpen={isOpenModalSignalIssue}
        onClose={onCloseModalSignalIssue}
        size="full"
      >
        <ModalOverlay />
        <ModalContent h="100dvh">
          <ModalBody display="flex" flexDir="column" px={4} h="100dvh">
            <LayoutOrderStatus
              title={
                orderHasIssue
                  ? `Votre problème est bien signalé ${user?.firstName}`
                  : "Contactez le service d’aide pour les bons d’achat"
              }
              subtitle="Pour obtenir de l’aide vous pouvez contacter directement les coordonnées ci-dessous"
              status="info"
              onClose={onCloseModalSignalIssue}
            >
              <Flex mt={10} direction={"column"} gap={4} w="full">
                <Flex direction={"column"} gap={4} mx={4}>
                  <Flex gap={4} alignItems="center" fontWeight={600}>
                    <Icon as={HiEnvelope} w={5} h={5} mb={-0.5} />
                    <Link
                      href="mailto:serviceclient@reducce.fr"
                      textDecor="underline"
                      textDecorationThickness="2px"
                      textUnderlineOffset={2}
                    >
                      serviceclient@reducce.fr
                    </Link>
                  </Flex>
                  <Flex gap={4} alignItems="center" fontWeight={600}>
                    <Icon as={HiPhone} w={5} h={5} mb={-0.5} />
                    <Link
                      href="telto:0472402828"
                      textDecor="underline"
                      textDecorationThickness="2px"
                      textUnderlineOffset={2}
                    >
                      04 72 40 28 28
                    </Link>
                  </Flex>
                </Flex>
                <Divider my={4} />
                <Flex direction="column" gap={4} fontSize={"sm"} mx={8}>
                  <Text textAlign="center" color="disabled">
                    Horaires de réponses
                  </Text>
                  <Flex justifyContent="space-between">
                    <Text>Du lundi au vendredi</Text>
                    <Text textAlign="end">
                      9h00 - 12h30
                      <br />
                      14h00 - 17h30
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text>Samedi et dimanche</Text>
                    <Text color="disabled">Indisponible</Text>
                  </Flex>
                </Flex>
              </Flex>
            </LayoutOrderStatus>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
