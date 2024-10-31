import {
  Modal,
  ModalContent,
  ModalCloseButton,
  Icon,
  ModalBody,
  AspectRatio,
  Flex,
  Box,
  Divider,
  Text,
} from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import Image from "../ui/Image";
import Bowser from "bowser";
import { useState } from "react";

type WebappBrowserTutorialsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const browsers = [
  {
    name: "Chrome",
    image: "/images/dashboard/browsers/chrome.png",
    videoId: "LFyZiOEz6rI",
  },
  {
    name: "Safari",
    image: "/images/dashboard/browsers/safari.png",
    videoId: "LFyZiOEz6rI",
  },
  {
    name: "Firefox",
    image: "/images/dashboard/browsers/firefox.png",
    videoId: "LFyZiOEz6rI",
  },
];

const WebappBrowserTutorialsModal = (
  props: WebappBrowserTutorialsModalProps
) => {
  const { isOpen, onClose } = props;

  const [currentBrowser, setCurrentBrowser] = useState<(typeof browsers)[0]>();

  if (typeof window !== "undefined" && !currentBrowser) {
    const browser = Bowser.getParser(window.navigator.userAgent);
    const currentBrowser = browser.getBrowserName();
    if (browsers.some((b) => b.name === currentBrowser)) {
      setCurrentBrowser(browsers.find((b) => b.name === currentBrowser));
    } else {
      setCurrentBrowser(browsers[0]);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent>
        <ModalCloseButton left={6} top={6}>
          <Icon as={HiChevronLeft} w={6} h={6} />
        </ModalCloseButton>
        <ModalBody mt={16} pb={12}>
          <AspectRatio ratio={9 / 16} mx={6}>
            <iframe
              src={`https://www.youtube.com/embed/${currentBrowser?.videoId}?autoplay=1&loop=1&showinfo=0&modestbranding=1&autohide=1`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Installation de l'appli cje"
              style={{
                borderRadius: "20px",
              }}
            />
          </AspectRatio>
          <Flex flexDir="column" mt={8}>
            <Box
              p={0.5}
              bgColor="white"
              shadow="icon"
              alignSelf="center"
              borderRadius="2lg"
            >
              <Image
                src={`/images/dashboard/browsers/${currentBrowser?.name.toLowerCase()}.png`}
                alt={`Logo de ${currentBrowser}`}
                width={0}
                height={0}
                sizes="100vw"
                imageStyle={{
                  width: "32px",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Text
              fontWeight={700}
              textAlign="center"
              mt={3}
              lineHeight="normal"
            >
              Ce tutoriel fonctionne
              <br />
              si vous utilisez {currentBrowser?.name}
            </Text>
            <Divider mt={8} mb={6} />
            <Flex flexDir="column" px={6} gap={5}>
              {browsers
                .filter((browser) => browser.name !== currentBrowser?.name)
                .map((browser) => (
                  <Flex
                    key={browser.name}
                    alignItems="center"
                    onClick={() => setCurrentBrowser(browser)}
                  >
                    <Box
                      p={0.5}
                      bgColor="white"
                      shadow="icon"
                      alignSelf="center"
                      borderRadius="2lg"
                    >
                      <Image
                        src={browser.image}
                        alt={`Logo de ${name}`}
                        width={0}
                        height={0}
                        sizes="100vw"
                        imageStyle={{
                          width: "32px",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Text fontWeight={700} noOfLines={1} ml={4}>
                      Tutoriel {browser.name} (IOS)
                    </Text>
                    <Icon as={HiChevronRight} w={6} h={6} ml="auto" />
                  </Flex>
                ))}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WebappBrowserTutorialsModal;
