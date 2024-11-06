import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Tag,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { HiEye, HiMinus, HiPlus } from "react-icons/hi2";
import { MdOutlineFileDownload } from "react-icons/md";
import { BarcodeIcon } from "~/components/icons/barcode";
import LoadingLoader from "~/components/LoadingLoader";
import BackButton from "~/components/ui/BackButton";
import Image from "~/components/ui/Image";
import { api } from "~/utils/api";
import { formatDateToDDMMYYYY } from "~/utils/tools";

export default function OrderObizPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const { id } = router.query as {
    id: string;
  };

  const [showDetails, setShowDetails] = useState(false);

  const {
    data: resultOrder,
    isLoading: isLoadingOrder,
    isRefetching: isRefetchingOrder,
  } = api.order.getById.useQuery(
    { id: parseInt(id) },
    { enabled: id !== undefined }
  );
  const { mutateAsync: mutateOrderSync, isLoading: isLoadingSyncOrder } =
    api.order.synchronizeOrder.useMutation({
      onSuccess: () => {
        utils.order.getById.invalidate();
      },
    });

  const { data: order } = resultOrder || {};

  const amount = useMemo(() => {
    return order?.articles?.reduce((acc, curr) => {
      return acc + curr.article_montant * curr.article_quantity;
    }, 0);
  }, [order?.articles]);

  useEffect(() => {
    if (order && order.status !== "delivered" && !isLoadingSyncOrder) {
      mutateOrderSync({ order_id: order.id });
    }
  }, [order?.status]);

  if (isLoadingOrder || !router.isReady) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  if (!order) {
    router.replace("/dashboard");
    return;
  }

  const showPDF = () => {
    if (order.ticket && typeof order.ticket === "object" && order.ticket.url) {
      window.open(order.ticket.url, "_blank", "noopener,noreferrer");
    }
  };

  const downloadPDF = () => {
    if (order.ticket && typeof order.ticket === "object" && order.ticket.url) {
      const link = document.createElement("a");
      link.href = order.ticket.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getOrderContent = () => {
    if (!order.articles) return;

    if (
      order.status !== "delivered" &&
      !isLoadingSyncOrder &&
      !isRefetchingOrder
    ) {
      return (
        <Flex
          flexDirection={"column"}
          gap={10}
          alignItems={"center"}
          bg="white"
          rounded={"2xl"}
          shadow={"xl"}
          p={10}
        >
          <Heading size={"md"} textAlign={"center"}>
            Vos billets sont en cours d'approvisionnement, veuillez revenir dans
            quelques minutes.
          </Heading>
        </Flex>
      );
    }

    if (isLoadingSyncOrder) {
      return (
        <Flex
          flexDirection={"column"}
          gap={10}
          alignItems={"center"}
          bg="white"
          rounded={"2xl"}
          shadow={"xl"}
          p={10}
        >
          <Flex direction={"column"} gap={4}>
            <Heading size={"md"} textAlign={"center"}>
              Nous récupérons vos billets chez notre partenaire
            </Heading>
            <Text color="disabled" textAlign={"center"} fontSize={"sm"}>
              Veuillez patienter ou revenir dans quelques secondes...
            </Text>
          </Flex>
          <LoadingLoader />
        </Flex>
      );
    }

    return (
      <>
        <Flex
          direction={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          bg="white"
          rounded={"2xl"}
          shadow={"xl"}
          p={6}
        >
          <Text>Valeur totale</Text>
          <Text fontWeight={900} fontSize="3xl" mt={2}>
            {amount}€
          </Text>
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
              <Button colorScheme="blackBtn" p={5} h="auto" onClick={showPDF}>
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
                onClick={downloadPDF}
              >
                <MdOutlineFileDownload fontSize={24} />
              </Button>
              <Text fontWeight={900} fontSize="sm" mt={1}>
                Télécharger
              </Text>
            </Box>
          </Flex>
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
        </Flex>
      </>
    );
  };

  return (
    <Flex
      minH="full"
      direction={"column"}
      position="relative"
      pt={16}
      px={6}
      bg="bgGray"
    >
      <Flex direction={"column"} gap={10}>
        <BackButton />
        <Flex
          alignItems={"center"}
          direction={"column"}
          px={4}
          rounded={"2xl"}
          gap={3}
          mx={4}
        >
          <Flex alignItems={"center"} gap={2}>
            <Box
              bg="white"
              rounded={"2xl"}
              borderWidth={1}
              borderColor={"bgGray"}
              overflow={"hidden"}
            >
              <Image
                src={order.offer.partner.icon.url || ""}
                width={60}
                height={order.offer.partner.icon.height || 50}
                alt={`Logo ${order.offer.partner.name}`}
              />
            </Box>
            <Text fontWeight={700} fontSize={"xl"}>
              {order.offer.partner.name}
            </Text>
          </Flex>
          <Tag bg="white" fontWeight={700}>
            <BarcodeIcon mr={1} /> Bon d'achat
          </Tag>
        </Flex>
        {getOrderContent()}
      </Flex>
    </Flex>
  );
}
