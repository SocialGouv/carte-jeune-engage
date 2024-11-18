import { SelectInput, useField, useFormFields } from "payload/components/forms";
import React from "react";
import { Offer } from "../payload-types";

export const getItemsConditionBlocks = (source: Offer["source"]) => {
  const cjeSpecificConditions = [
    {
      text: "Offre valable 1 seule fois",
      slug: "one-time",
      icon: "HiMiniEye",
    },
    {
      text: "Offre utilisable à l'infini",
      slug: "all-time",
      icon: "TiInfinity",
    },
  ];

  return [
    {
      text: "Utilisable en magasin",
      slug: "go-to-store",
      icon: "HiBuildingStorefront",
    },
    {
      text: "Utilisable en ligne",
      slug: "use-link",
      icon: "HiCursorArrowRays",
    },
    {
      text: "Utilisable en plusieurs fois",
      slug: "usable-in-parts",
      icon: "HiRectangleStack",
    },
    ...(source === "cje" ? cjeSpecificConditions : []),
    {
      text: "Cumulable avec d’autres moyens de paiement",
      slug: "cumulative-with-other-payment-methods",
      icon: "HiCreditCard",
    },
    {
      text: "Cumulable avec d’autres bons",
      slug: "cumulative-with-other-codes",
      icon: "BsCashStack",
    },
  ];
};

export const CustomSelectConditionBlocks: React.FC<{ path: string }> = ({
  path,
}) => {
  const { value, setValue } = useField<string>({ path });
  const [options, setOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

  const offerSource = useFormFields(([fields, _]) => fields.kind);

  console.log("offerSource", offerSource);

  React.useEffect(() => {
    const tmpOptions = getItemsConditionBlocks(
      offerSource.value as Offer["source"]
    ).map((item) => ({
      label: item.text,
      value: item.slug,
    }));
    setOptions(tmpOptions);
  }, [offerSource]);

  return (
    <div className="field-type">
      <label className="field-label">Texte</label>
      <SelectInput
        path={path}
        name={path}
        options={options}
        value={value}
        onChange={(e) => setValue(e.value)}
      />
    </div>
  );
};
