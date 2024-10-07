import { type AppType } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import DefaultLayout from "~/layouts/DefaultLayout";
import "~/styles/globals.css";

import { api } from "~/utils/api";
import { ReactNode, useEffect } from "react";
import { theme } from "~/utils/chakra-theme";
import { usePathname } from "next/navigation";
import { AuthProvider } from "~/providers/Auth";
import { init } from "@socialgouv/matomo-next";

const MATOMO_TRACKING_ENABLED = process.env
  .NEXT_PUBLIC_MATOMO_TRACKING_ENABLED as string;
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL as string;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID as string;

const MyApp: AppType = ({ Component, pageProps }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (MATOMO_TRACKING_ENABLED === "true") {
      init({
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, []);

  const getLayout = (children: ReactNode) => {
    if (pathname?.startsWith("/admin")) {
      return children;
    } else {
      return (
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <DefaultLayout>{children}</DefaultLayout>
          </AuthProvider>
        </ChakraProvider>
      );
    }
  };

  return getLayout(<Component {...pageProps} />);
};

export default api.withTRPC(MyApp);
