import { Button, Center } from "@chakra-ui/react";
import { api } from "~/utils/api";

export default function TextSync() {
  const { mutateAsync: mutateOrderSync } =
    api.order.synchronizeOrder.useMutation({});

  return (
    <Center h="full" w="full" px={10}>
      <Button
        colorScheme="blackBtn"
        w="full"
        onClick={() => {
          mutateOrderSync({
            order_id: 5,
          });
        }}
      >
        SYNCHRONIZE
      </Button>
    </Center>
  );
}
