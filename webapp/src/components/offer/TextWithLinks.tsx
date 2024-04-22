import { ChakraProps, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";
import { Fragment } from "react";

const TextWithLinks = ({
  text,
  props,
}: {
  text: string;
  props?: ChakraProps;
}) => {
  const URL_REGEX = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  const html = text.split(" ").map((part, index) => {
    if (URL_REGEX.test(part)) {
      const urlPart = part.startsWith("www.") ? `http://${part}` : part;
      return (
        <>
          <Link
            as={NextLink}
            key={`${part}-${index}`}
            href={urlPart}
            borderBottom="1px solid black"
            _hover={{ textDecoration: "none" }}
            isExternal
          >
            {part}
          </Link>{" "}
        </>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part} </Fragment>;
  });

  return (
    <Text key={text} {...props}>
      {html}
    </Text>
  );
};

export default TextWithLinks;
