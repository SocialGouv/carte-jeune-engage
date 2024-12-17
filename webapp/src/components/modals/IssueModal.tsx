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
import { useState } from "react";
import {
  HiEnvelope,
  HiPhone,
  HiChevronRight,
  HiMiniPaperAirplane,
  HiCheckCircle,
} from "react-icons/hi2";
import { IconType } from "react-icons/lib";
import { api } from "~/utils/api";
import ConditionalLink from "../ConditionalLink";

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
          <RadioGroup display="flex" flexDir="column" gap={3} mt={8}>
            {issues.map((cause) => (
              <Flex key={cause} alignItems="center">
                <Radio
                  value={cause}
                  onChange={() => setSelectedCause(cause)}
                  gap={2}
                >
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered={kind === "coupon"}>
      <ModalOverlay />
      <ModalContent
        mx={2.5}
        mt={kind == "order" ? 5 : "auto"}
        borderRadius="2.5xl"
      >
        <ModalCloseButton size="lg" top={4} right={4} />
        <ModalBody display="flex" flexDir="column" px={9} pb={16} pt={4}>
          {/* <OrderIssueContent kind={kind} id={id} issues={issues} /> */}
          {/* <Divider my={6} /> */}
          <Flex direction="column" gap={4} mt={16}>
            {/* <ItemLink
              onClick={() => setIsOpenCrisp(true)}
              icon={HiMiniChatBubbleOvalLeftEllipsis}
              text="Discutez avec nous en direct"
            />
            <Text
              my={2}
              fontSize={14}
              fontWeight={500}
              textAlign="center"
              color="disabled"
            >
              ou
            </Text> */}
            {kind === "order" ? (
              <>
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
                <Flex direction="column" gap={4} fontSize={"sm"}>
                  <Text fontWeight={500} textAlign="center" color="disabled">
                    Disponible du lundi au vendredi de
                    <br />
                    09h à 12h30 puis de 14h à 17h30
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <ItemLink
                  href="mailto:cje@fabrique.social.gouv.fr"
                  icon={HiEnvelope}
                  text="cje@fabrique.social.gouv.fr"
                />
              </>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default IssueModal;
