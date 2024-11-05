import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSideProps, NextApiRequest } from "next";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import FormField from "~/components/forms/FormField";
import LoginOtpContent from "~/components/landing/LoginOtpContent";
import { LoginForm } from "~/components/landing/PhoneNumberCTA";
import LoginWrapper from "~/components/wrappers/LoginWrapper";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { generateSteps } from "~/utils/form/formHelpers";
import {
  LoginWidgetFormData,
  loginWidgetSchema,
} from "~/utils/form/formSchemas";
import jwt from "jsonwebtoken";
import { ZWidgetToken } from "~/server/types";
import { decryptData } from "~/utils/tools";
import { appRouter } from "~/server/api/root";
import getPayloadClient from "~/payload/payloadClient";
import { createCallerFactory } from "~/server/api/trpc";

type HomeLoginWidgetProps = {
  cej_id: string;
  offer_id?: string;
};

export default function HomeLoginWidget({
  cej_id,
  offer_id,
}: HomeLoginWidgetProps) {
  const { isOtpGenerated, setIsOtpGenerated } = useAuth();

  const methods = useForm<LoginWidgetFormData>({
    resolver: zodResolver(loginWidgetSchema),
  });

  const [currentStep] = generateSteps(loginWidgetSchema);

  const onSubmit: SubmitHandler<LoginWidgetFormData> = (data) => {
    handleGenerateOtp({
      phone_number: data.phoneNumber,
      user_email: data.userEmail,
    });
  };

  const [otpKind, setOtpKind] = useState<"otp" | "email">();
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>("");

  const { mutate: generateOtp, isLoading: isLoadingOtp } =
    api.user.generateOTP.useMutation({
      onSuccess: (data) => {
        setIsOtpGenerated(true);
        setOtpKind(data.kind);
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          methods.setError("phoneNumber", {
            type: "conflict",
            message:
              "Votre numéro de téléphone n'est pas autorisé à accéder à l'application",
          });
        } else {
          methods.setError("phoneNumber", {
            type: "internal",
            message: "Erreur coté serveur, veuillez contacter le support",
          });
        }
      },
    });

  const handleGenerateOtp: SubmitHandler<LoginForm> = async (values) => {
    setCurrentPhoneNumber(values.phone_number);
    generateOtp({ ...values, cej_id });
  };

  useEffect(() => {
    if (offer_id && !isNaN(parseInt(offer_id))) {
      localStorage.setItem("cje-widget-redirection-offer-id", offer_id);
    }
  });

  if (isOtpGenerated && otpKind)
    return (
      <LoginWrapper
        onBack={() => {
          setIsOtpGenerated(false);
          setOtpKind(undefined);
        }}
      >
        <Box mt={otpKind === "otp" ? 8 : 12}>
          <LoginOtpContent
            otpKind={otpKind}
            currentPhoneNumber={currentPhoneNumber}
            handleGenerateOtp={handleGenerateOtp}
          />
        </Box>
      </LoginWrapper>
    );

  return (
    <LoginWrapper>
      <FormProvider {...methods}>
        <Flex
          as="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          flexDir="column"
          mt={8}
        >
          <Heading as="h1" size="lg" fontWeight="extrabold" textAlign="center">
            Créez votre compte pour débloquer votre code
          </Heading>
          <Box mt={12}>
            {currentStep.fields.map((field, index) => (
              <Box key={field.name} mt={index !== 0 ? 8 : 0}>
                <FormField
                  field={field}
                  setIsAutocompleteInputFocused={() => {}}
                />
              </Box>
            ))}
          </Box>
          <Button mt={24} type="submit" isLoading={isLoadingOtp}>
            Suivant
          </Button>
        </Flex>
      </FormProvider>
    </LoginWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    let { widgetToken, offer_id } = context.query;
    if (!widgetToken)
      widgetToken =
        context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!];

    if (!widgetToken || typeof widgetToken !== "string") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const decoded = jwt.verify(widgetToken, process.env.WIDGET_SECRET_JWT!);
    const tokenObject = ZWidgetToken.parse(decoded);
    const cejUserId = decryptData(
      tokenObject.user_id,
      process.env.WIDGET_SECRET_DATA_ENCRYPTION!
    );

    if (!context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!]) {
      context.res.setHeader(
        "Set-Cookie",
        `${process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME}=${widgetToken}; Expires=${new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ).toUTCString()}; Path=/; SameSite=None; Secure`
      );
      context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!] =
        widgetToken;
    }

    const payload = await getPayloadClient({ seed: false });

    const users = await payload.find({
      collection: "users",
      where: {
        cej_id: {
          equals: cejUserId,
        },
      },
    });

    // If no user found, we redirect to the widget login page
    if (!users.docs.length) {
      return {
        props: {
          cej_id: cejUserId,
          offer_id,
        },
      };
    }

    // If user found, we log him in and redirect to the dashboard
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      payload,
      session: null,
      soapObizClient: null,
      req: context.req as NextApiRequest,
    });

    const { data: userSession } = await caller.widget.login({
      user_id: cejUserId,
      widget_token: widgetToken,
    });

    context.res.setHeader(
      "Set-Cookie",
      `${process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"}=${userSession.token}; Expires=${new Date(
        (userSession.exp as number) * 1000
      ).toUTCString()}; Path=/; SameSite=None; Secure`
    );

    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
