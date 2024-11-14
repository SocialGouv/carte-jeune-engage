import { useState } from "react";
import OtpGenerated from "./OtpGenerated";
import { api } from "~/utils/api";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import BigLoader from "../BigLoader";
import { SubmitHandler } from "react-hook-form";
import { LoginForm } from "./PhoneNumberCTA";

type LoginOtpContentProps = {
  otpKind: "otp" | "email";
  currentPhoneNumber: string;
  handleGenerateOtp: SubmitHandler<LoginForm>;
};

const LoginOtpContent = (props: LoginOtpContentProps) => {
  const { currentPhoneNumber, otpKind, handleGenerateOtp } = props;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [hasOtpError, setHasOtpError] = useState(false);
  const [hasOtpExpired, setHasOtpExpired] = useState(false);

  const { mutate: loginUser, isLoading: isLoadingLogin } =
    api.user.loginUser.useMutation({
      onSuccess: async ({ data }) => {
        setCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
          data.token || "",
          { expires: new Date((data.exp as number) * 1000), sameSite: "lax" }
        );
        router.reload();
        router.push("/dashboard");
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401 || data?.httpStatus === 404) {
          setHasOtpError(true);
        } else if (data?.httpStatus === 408) {
          setHasOtpExpired(true);
        }
        setIsLoading(false);
      },
    });

  const handleLoginUser = async (otp: string) => {
    setIsLoading(true);
    loginUser({
      phone_number: currentPhoneNumber,
      otp,
    });
  };

  if (isLoading || isLoadingLogin) return <BigLoader />;

  return (
    <OtpGenerated
      currentPhoneNumber={currentPhoneNumber}
      kind={otpKind}
      otp={otp}
      setOtp={setOtp}
      hasOtpError={hasOtpError}
      setHasOtpError={setHasOtpError}
      hasOtpExpired={hasOtpExpired}
      setHasOtpExpired={setHasOtpExpired}
      handleGenerateOtp={handleGenerateOtp}
      handleLoginUser={handleLoginUser}
    />
  );
};

export default LoginOtpContent;
