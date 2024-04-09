import { getCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import React, { useState, createContext, useContext, useEffect } from "react";
import { UserIncluded } from "~/server/api/routers/user";
import * as Sentry from "@sentry/browser";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type AuthContext = {
  user: UserIncluded | null;
  setUser: (user: UserIncluded | null) => void;
  isOtpGenerated: boolean;
  setIsOtpGenerated: (isOtpGenerated: boolean) => void;
  showing: boolean;
  setShowing: (showing: boolean) => void;
  showNotificationModal: boolean;
  setShowNotificationModal: (showNotificationModal: boolean) => void;
  showModalInstallApp: boolean;
  setShowModalInstallApp: (showModalInstallApp: boolean) => void;
  deferredEvent: BeforeInstallPromptEvent | null;
  setDeferredEvent: (event: BeforeInstallPromptEvent | null) => void;
  refetchUser: () => void;
};

const Context = createContext({} as AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserIncluded | null>(null);

  const [isOtpGenerated, setIsOtpGenerated] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(true);
  const [showModalInstallApp, setShowModalInstallApp] =
    useState<boolean>(false);

  const [showing, setShowing] = useState(false);
  const [deferredEvent, setDeferredEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const router = useRouter();

  const fetchMe = async () => {
    const jwtToken = getCookie(process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt");
    if (!jwtToken) return;

    const decoded = jwtDecode(jwtToken);
    const collection = (decoded as any)["collection"] as string;
    try {
      const result = await fetch(`/api/${collection}/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }).then((req) => req.json());

      if (result && result.user !== null) {
        setUser(result.user);
      } else {
        setUser(null);
        deleteCookie(process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt");
        router.push("/");
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log("error : ", e);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        isOtpGenerated,
        setIsOtpGenerated,
        showing,
        setShowing,
        showNotificationModal,
        setShowNotificationModal,
        showModalInstallApp,
        setShowModalInstallApp,
        deferredEvent,
        setDeferredEvent,
        refetchUser: fetchMe,
      }}
    >
      {children}
    </Context.Provider>
  );
};

type UseAuth = () => AuthContext;

export const useAuth: UseAuth = () => useContext(Context);
