import {
	ChakraProps,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	InputProps,
	Textarea,
} from "@chakra-ui/react";
import { HTMLInputTypeAttribute } from "react";
import {
	FieldError,
	UseFormRegister,
	ValidationValueMessage,
} from "react-hook-form";

export type FieldProps = {
	label?: string;
	name: string;
	kind: HTMLInputTypeAttribute;
	placeholder?: string;
	prefix?: string;
	rules?: {
		[key: string]:
		| string
		| number
		| ((value: string | number) => boolean | string)
		| ValidationValueMessage;
	};
};

interface Props {
	field: FieldProps;
	register: UseFormRegister<any>;
	fieldError?: FieldError | undefined;
	wrapperProps?: ChakraProps;
	inputProps?: InputProps;
}

const FormInput = ({
	field: { name, kind, rules, label, placeholder, prefix },
	register,
	fieldError,
	wrapperProps,
	inputProps,
}: Props) => {
	const { autoFocus = true, ...restInputProps } = inputProps || {};

	return (
		<FormControl
			isRequired={inputProps?.isRequired === undefined ? true : inputProps?.isRequired}
			isInvalid={!!fieldError}
			{...wrapperProps}
			variant="floating"
			_before={
				prefix
					? {
						content: `"${prefix}"`,
						position: "absolute",
						top: "1rem",
						left: "1rem",
						width: "1rem",
						height: "1rem",
						zIndex: 99,
					}
					: {}
			}
		>
			<Input
				id={name}
				as={kind === 'textarea' ? Textarea : Input}
				{...restInputProps}
				autoFocus={autoFocus}
				type={kind}
				placeholder={placeholder}
				borderRadius={16}
				border="none"
				errorBorderColor="transparent"
				autoComplete="off"
				backgroundColor={!fieldError ? "cje-gray.500" : "errorLight"}
				pr={5}
				pl={prefix ? 12 : 5}
				pt={label ? 9 : 7}
				pb={7}
				_focusVisible={{
					borderColor: "transparent",
					boxShadow: "none",
				}}
				{...register(name, { ...rules })}
				position={"relative"}
			/>
			{label && (
				<FormLabel fontWeight="medium" color="disabled">
					{label}
				</FormLabel>
			)}
			<FormErrorMessage>{fieldError?.message}</FormErrorMessage>
		</FormControl>
	);
};

export default FormInput;
