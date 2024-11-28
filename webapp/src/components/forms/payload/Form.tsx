import React, { useState, useCallback } from "react";
import { buildInitialFormState } from "./buildInitialFormState";
import { fields } from "./fields";
import { Form as FormType } from "@payloadcms/plugin-form-builder/dist/types";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  Box,
  ButtonGroup,
  Flex,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi2";

export type Value = unknown;

export interface Property {
  [key: string]: Value;
}

export interface Data {
  [key: string]: Value | Property | Property[];
}

export type FormBlockType = {
  blockName?: string;
  blockType?: "formBlock";
  enableIntro: Boolean;
  form: FormType;
};

const FormField = ({
  formFromProps,
  register,
  errors,
  control,
  formMethods,
  field,
}: {
  formFromProps: FormType;
  register: any;
  errors: any;
  control: any;
  formMethods: any;
  field: any;
}) => {
  const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields];
  if (Field) {
    return (
      <React.Fragment key={field.blockName}>
        <Field
          form={formFromProps}
          field={field}
          {...formMethods}
          register={register}
          errors={errors}
          control={control}
        />
      </React.Fragment>
    );
  }
  return null;
};

export const FormBlock: React.FC<
  FormBlockType & {
    id?: string;
    afterOnSubmit: () => void;
  }
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: {
      id: formID,
      submitButtonLabel,
      confirmationType,
      redirect,
      confirmationMessage,
    } = {},
    afterOnSubmit,
  } = props;

  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = formMethods;

  const { mutateAsync } = api.form.submitForm.useMutation();

  const [currentStep, setCurrentStep] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>();
  const [error, setError] = useState<
    { status?: string; message: string } | undefined
  >();
  const router = useRouter();

  const handleNextStep = () => {
    if (currentStep === formFromProps.fields.length - 1) {
      onSubmit(formMethods.getValues());
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = useCallback(
    (data: Data) => {
      let loadingTimerID: ReturnType<typeof setTimeout>;

      const submitForm = async () => {
        setError(undefined);

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        })) as { field: string; value: string }[];

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true);
        }, 1000);

        try {
          await mutateAsync({
            formId: formID as unknown as number,
            submissionData: dataToSend,
          });

          clearTimeout(loadingTimerID);

          setIsLoading(false);
          setHasSubmitted(true);

          afterOnSubmit();
          // if (confirmationType === "redirect" && redirect) {
          //   const { url } = redirect;

          //   const redirectUrl = url;

          //   if (redirectUrl) router.push(redirectUrl);
          // }
        } catch (err) {
          console.warn(err);
          setIsLoading(false);
          setError({
            message: "Something went wrong.",
          });
        }
      };

      submitForm();
    },
    [router, formID, redirect, confirmationType]
  );

  return (
    <div>
      {/* {enableIntro && introContent && !hasSubmitted && (
        <div>{introContent}</div>
      )} */}
      {!isLoading && hasSubmitted && confirmationType === "message" && (
        <pre>{JSON.stringify(confirmationMessage, null, 2)}</pre>
      )}
      {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
      {error && <div>{`${error.status || "500"}: ${error.message || ""}`}</div>}
      {!hasSubmitted && (
        <Box as="form" id={formID} onSubmit={handleSubmit(onSubmit)} w="full">
          <div>
            {formFromProps && formFromProps.fields && (
              <Flex flexDir="column" gap={6}>
                {"label" in formFromProps.fields[currentStep] && (
                  <Text fontSize={24} fontWeight={800} textAlign="center">
                    {formFromProps.fields[currentStep].label}
                  </Text>
                )}
                <FormField
                  formFromProps={formFromProps}
                  register={register}
                  errors={errors}
                  control={control}
                  formMethods={formMethods}
                  field={{ ...formFromProps.fields[currentStep], label: "" }}
                />
              </Flex>
            )}
          </div>
          <ButtonGroup justifyContent="space-between" w="full" mt={6}>
            {/* {currentStep > 0 && (
              <IconButton
                colorScheme="blackBtn"
                aria-label="Next"
                icon={<Icon as={HiArrowLeft} w={5} h={5} />}
                onClick={handlePrevStep}
                px={6}
              />
            )} */}
            <IconButton
              colorScheme="blackBtn"
              aria-label="Next"
              icon={<Icon as={HiArrowRight} w={5} h={5} />}
              onClick={handleNextStep}
              ml="auto"
              px={6}
            />
          </ButtonGroup>
        </Box>
      )}
    </div>
  );
};
