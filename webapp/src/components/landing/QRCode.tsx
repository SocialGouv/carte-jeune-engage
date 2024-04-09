import { Box, ChakraProps, Image } from "@chakra-ui/react";
import { QRCode } from "react-qrcode-logo";
import { getBaseUrl } from "~/utils/tools";

type QRCodeProps = {
  size?: number;
  wrapperProps?: ChakraProps;
};

const QRCodeWrapper = ({ size, wrapperProps }: QRCodeProps) => {
  const qrCodeImageSrc = () => {
    if (process.env.NEXT_PUBLIC_ENV_APP === "preproduction") {
      return "/images/landing/qr-code-preprod.png";
    }
    return "/images/landing/qr-code-prod.png";
  };

  // REMOVE LOGO FOR NOW - ISSUES WITH SCANNING ON SOME PHONES
  return (
    <Box {...wrapperProps} borderRadius="2xl">
      <Image
        src={qrCodeImageSrc()}
        alt="QR Code production"
        h="200px"
        w="200px"
      />
      {/* REMOVE FOR NOW , ISSUES ON IPHONE
			<QRCode
				value={getBaseUrl()}
				qrStyle="dots"
				logoWidth={50}
				logoHeight={30}
				eyeRadius={16}
				logoPadding={2.5}
				size={size ?? 256}
			logoImage="/images/cje-logo.png"
			/> */}
    </Box>
  );
};

export default QRCodeWrapper;
