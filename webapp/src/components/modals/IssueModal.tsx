import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  Divider,
  Text,
  Icon,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Button,
  Center,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  HiMiniChatBubbleOvalLeftEllipsis,
  HiEnvelope,
  HiPhone,
  HiChevronRight,
  HiMiniPaperAirplane,
  HiCheckCircle,
} from "react-icons/hi2";
import { IconType } from "react-icons/lib";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import ConditionalLink from "../ConditionalLink";

const CRISP_TOKEN = process.env.NEXT_PUBLIC_CRISP_TOKEN as string;

const defaultIssueCases = [
  "Le prix avec la réduction ne correspond pas",
  "Autre chose",
];

const ItemLink = ({
  href,
  icon,
  text,
  onClick,
}: {
  href?: string;
  onClick?: () => void;
  icon: IconType;
  text: string;
}) => {
  return (
    <Flex alignItems="center" fontWeight={600}>
      <Icon as={icon} w={5} h={5} mb={-0.5} mr={4} />
      <ConditionalLink condition={!!href} to={href || ""}>
        <Text
          fontWeight={800}
          textDecor="underline"
          textDecorationThickness="2px"
          textUnderlineOffset={2}
          onClick={onClick}
        >
          {text}
        </Text>
      </ConditionalLink>
      <Icon as={HiChevronRight} w={4} h={4} ml="auto" />
    </Flex>
  );
};

const OrderIssueContent = ({
  id,
  kind,
  issues,
}: {
  id: number;
  kind: "order" | "coupon";
  issues: string[];
}) => {
  const {
    mutateAsync: mutateCreateOrderSignal,
    isLoading: isLoadingCreatingOrderSignal,
  } = api.order.createSignal.useMutation();

  const {
    mutateAsync: mutateCreateCouponSignal,
    isLoading: isLoadingCreatingCouponSignal,
  } = api.coupon.createSignal.useMutation();

  const [currentStep, setCurrentStep] = useState<"success">();
  const [selectedCause, setSelectedCause] = useState<string>();

  const signalIssueWithOrder = async () => {
    await (
      kind === "order" ? mutateCreateOrderSignal : mutateCreateCouponSignal
    )({
      id,
      cause: selectedCause,
    });
    setSelectedCause(undefined);
    setCurrentStep("success");
  };

  switch (currentStep) {
    case "success":
      return (
        <Center flexDir="column" mt={8} gap={6}>
          <Icon as={HiCheckCircle} w={10} h={10} color="success" />
          <Text fontSize={24} fontWeight={800} textAlign="center">
            On va trouver une
            <br />
            solution rapidement !
          </Text>
          <Text fontSize={24} fontWeight={800} textAlign="center">
            Contactez-nous
            <br />
            directement ⬇️
          </Text>
        </Center>
      );
    default:
      return (
        <Flex flexDir="column" mt={8}>
          <Text fontSize={24} fontWeight={800} textAlign="center">
            Mince !
            <br />
            Que se passe-t-il ?
          </Text>
          <RadioGroup display="flex" flexDir="column" gap={3.5} mt={8} px={4}>
            {issues.map((cause) => (
              <Flex key={cause} alignItems="center">
                <Radio value={cause} onChange={() => setSelectedCause(cause)}>
                  <Text fontWeight={cause === selectedCause ? 800 : 500}>
                    {cause}
                  </Text>
                </Radio>
              </Flex>
            ))}
          </RadioGroup>
          <Button
            w="75%"
            mx="auto"
            mt={8}
            iconSpacing={4}
            fontWeight={800}
            colorScheme="blackBtn"
            rightIcon={<Icon as={HiMiniPaperAirplane} w={5} h={5} mb={-0.5} />}
            isDisabled={!selectedCause}
            isLoading={
              isLoadingCreatingCouponSignal || isLoadingCreatingOrderSignal
            }
            onClick={signalIssueWithOrder}
          >
            Envoyer mon avis
          </Button>
        </Flex>
      );
  }
};

type IssueModalDefaultProps = {
  isOpen: boolean;
  onClose: () => void;
};

interface IssueModalOrder extends IssueModalDefaultProps {
  kind: "order";
  order_id: number;
}

interface IssueModalCoupon extends IssueModalDefaultProps {
  kind: "coupon";
  coupon_id: number;
}

type IssueModalProps = IssueModalOrder | IssueModalCoupon;

const IssueModal = (props: IssueModalProps) => {
  const { isOpen, onClose, kind } = props;
  const { user } = useAuth();
  const CrispWithNoSSR = dynamic(() => import("../support/Crisp"));

  const [isOpenCrisp, setIsOpenCrisp] = useState(false);

  const id = kind === "order" ? props.order_id : props.coupon_id;

  const issues =
    kind === "order"
      ? [
          "Mon bon d’achat n’arrive toujours pas...",
          "Je ne comprends pas comment utiliser mon bon",
          "Mon bon ne fonctionne pas sur internet",
          "Mon bon ne fonctionne pas en boutique",
          ...defaultIssueCases,
        ]
      : [
          "Le code ou le lien ne fonctionne pas",
          "Mon code ou le lien ne s’affiche pas",
          "La réduction est trop faible",
          "Je ne comprends pas comment utiliser l’offre",
          ...defaultIssueCases,
        ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent minH="full">
        <ModalCloseButton />
        <ModalBody display="flex" flexDir="column" px={8} pb={8} minH="full">
          <OrderIssueContent kind={kind} id={id} issues={issues} />
          <Divider my={6} />
          <Flex direction={"column"} gap={4} w="full">
            <Flex direction={"column"} gap={4} mx={4}>
              <ItemLink
                onClick={() => setIsOpenCrisp(true)}
                icon={HiMiniChatBubbleOvalLeftEllipsis}
                text="Discutez avec nous en direct"
              />
              {kind === "order" && (
                <>
                  <Text
                    my={2}
                    fontSize={14}
                    fontWeight={500}
                    textAlign="center"
                    color="disabled"
                  >
                    ou
                  </Text>
                  <ItemLink
                    href="telto:0472402828"
                    icon={HiPhone}
                    text="04 72 40 28 28"
                  />
                  <ItemLink
                    href="mailto:serviceclient@reducce.fr"
                    icon={HiEnvelope}
                    text="serviceclient@reducce.fr"
                  />
                  <Flex
                    direction="column"
                    gap={4}
                    fontSize={"sm"}
                    mx={8}
                    mt={3}
                  >
                    <Text textAlign="center" color="disabled">
                      Disponible du lundi au vendredi de
                      <br />
                      09h à 12h30 puis de 14h à 17h30
                    </Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </ModalBody>
        {isOpenCrisp && user && (
          <CrispWithNoSSR
            crispToken={CRISP_TOKEN}
            user={user}
            onClose={() => {
              setIsOpenCrisp(false);
            }}
          />
        )}
      </ModalContent>
    </Modal>
  );
};

export default IssueModal;
