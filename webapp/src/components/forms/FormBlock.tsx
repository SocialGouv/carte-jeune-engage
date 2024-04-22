import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";

type Props = {
	children: React.ReactNode;
	value: string;
	currentValue: string | string[];
	iconSrc?: string;
	onChange: (value: string | undefined) => void;
};

const FormBlock = ({
	children,
	value,
	currentValue,
	onChange,
	iconSrc,
}: Props) => {
	const isSelected =
		typeof currentValue === "string"
			? currentValue === value
			: currentValue?.includes(value);

	return (
		<Flex
			flex={1}
			flexDir="column"
			w="full"
			bgColor="cje-gray.500"
			borderRadius="2xl"
			py={6}
			fontWeight="medium"
			justifyContent="center"
			alignItems="center"
			onClick={() => {
				typeof currentValue !== "string" && isSelected
					? onChange(undefined)
					: onChange(value);
			}}
			border="2px solid"
			borderColor={isSelected ? "blackLight" : "transparent"}
			cursor="pointer"
		>
			{iconSrc && <Image src={iconSrc} alt="" width={65} height={65} />}
			<Text
				fontWeight={isSelected ? "bold" : "medium"}
				textAlign="center"
				noOfLines={1}
				mt={iconSrc ? 2 : 0}
			>
				{children}
			</Text>
		</Flex>
	);
};

export default FormBlock;
