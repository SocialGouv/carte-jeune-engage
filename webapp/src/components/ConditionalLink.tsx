import { ChakraProps, LinkProps, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { HTMLAttributeAnchorTarget } from "react";

type ConditionalLinkProps = {
  children: React.ReactNode;
  condition: boolean;
  target?: HTMLAttributeAnchorTarget;
  to: string;
  props?: ChakraProps & LinkProps;
};

export default function ConditionalLink({
  children,
  condition,
  to,
  target,
  props,
}: ConditionalLinkProps) {
  return !!condition && to ? (
    <Link as={NextLink} href={to} target={target} passHref {...props}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}
