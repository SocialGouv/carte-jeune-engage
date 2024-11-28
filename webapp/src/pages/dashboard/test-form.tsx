import { Button, Center, Text } from "@chakra-ui/react";
import { FormBlock } from "~/components/forms/payload/Form";

import { api } from "~/utils/api";

export default function TextForm() {
  const { data: resultForm } = api.form.getFormBySlug.useQuery({
    slug: "test-form",
  });

  const { data } = resultForm || {};

  return (
    <Center flexDir="column" h="full" w="full" px={10}>
      <Text>This is a test form</Text>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {data && <FormBlock form={data} enableIntro={true} />}
    </Center>
  );
}
