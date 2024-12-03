import React, { useState, useCallback } from "react";
import { buildInitialFormState } from "./buildInitialFormState";
import { fields } from "./fields";
import {
  CountryField,
  Form as FormType,
  TextAreaField,
} from "@payloadcms/plugin-form-builder/dist/types";
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
import { HiArrowRight } from "react-icons/hi2";

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
  form: Omit<FormType, "fields"> & { fields: (CountryField | TextAreaField)[] };
};

export const FormBlock: React.FC<
  FormBlockType & {
    id?: string;
    offer_id: number;
    afterOnSubmit: () => void;
  }
> = (props) => {
  const {
    form: formFromProps,
    form: { id: formID, confirmationType, redirect } = {},
    offer_id,
    afterOnSubmit,
  } = props;

  const formMethods = useForm<{ [x: string]: any }>({
    defaultValues: buildInitialFormState(formFromProps.fields),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = formMethods;

  const formValues = watch();

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

  // const handlePrevStep = () => {
  //   setCurrentStep((prev) => prev - 1);
  // };

  const onSubmit = useCallback(
    (data: Data) => {
      let loadingTimerID: ReturnType<typeof setTimeout>;

      const submitForm = async () => {
        setError(undefined);

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        })) as { field: string; value: string }[];

        loadingTimerID = setTimeout(() => {
          setIsLoading(true);
        }, 1000);

        try {
          await mutateAsync({
            formId: formID as unknown as number,
            submissionData: dataToSend,
            offer_id,
          });

          clearTimeout(loadingTimerID);

          setIsLoading(false);
          setHasSubmitted(true);

          afterOnSubmit();
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
      {error && <div>{`${error.status || "500"}: ${error.message || ""}`}</div>}
      {!hasSubmitted && (
        <Box as="form" id={formID} onSubmit={handleSubmit(onSubmit)} w="full">
          <div>
            {formFromProps &&
              formFromProps.fields &&
              (() => {
                const field = formFromProps.fields[currentStep];
                const Field: React.FC<any> =
                  fields?.[field.blockType as keyof typeof fields];
                return (
                  <Flex flexDir="column" gap={6}>
                    {"label" in field && (
                      <Text fontSize={24} fontWeight={800} textAlign="center">
                        {field.label}
                      </Text>
                    )}
                    <React.Fragment key={field.blockName}>
                      <Field
                        form={formFromProps}
                        field={{ ...field, label: undefined }}
                        {...formMethods}
                        register={register}
                        errors={errors}
                        control={control}
                      />
                    </React.Fragment>
                  </Flex>
                );
              })()}
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
              isLoading={isLoading || hasSubmitted}
              icon={<Icon as={HiArrowRight} w={5} h={5} />}
              onClick={handleNextStep}
              isDisabled={
                formFromProps.fields[currentStep].required &&
                (!formValues[
                  formFromProps.fields[currentStep].blockName as string
                ] ||
                  formValues[
                    formFromProps.fields[currentStep].blockName as string
                  ] === "")
              }
              ml="auto"
              px={6}
            />
          </ButtonGroup>
        </Box>
      )}
    </div>
  );
};
