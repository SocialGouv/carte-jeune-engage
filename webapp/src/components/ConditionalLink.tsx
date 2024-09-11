import { ChakraProps, LinkProps, Link } from "@chakra-ui/react";
import NextLink from "next/link";

export default function ConditionalLink({
  children,
  condition,
  to,
  props,
}: {
  children: React.ReactNode;
  condition: boolean;
  to: string;
  props: ChakraProps & LinkProps;
}) {
  return !!condition && to ? (
    <Link as={NextLink} href={to} passHref {...props}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}
