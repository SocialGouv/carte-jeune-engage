import { SelectInput, useField, useFormFields } from "payload/components/forms";
import React from "react";
import { Offer } from "../payload-types";

export const getItemsKind = (offerSource: Offer["source"]) => {
  let items: { label: string; value: string }[] = [];

  if (offerSource === "cje") {
    items = [
      { label: "[En magasin] Bon d'achat + carte CJE", value: "voucher" },
      { label: "[En magasin] Carte CJE", value: "voucher_pass" },
      { label: "[En ligne] Code de réduction", value: "code" },
      { label: "[En ligne] Espace de réduction", value: "code_space" },
    ];
  }

  if (offerSource === "obiz") {
    items = [
      { label: "[En ligne] Paiement en ligne obiz", value: "code_obiz" },
    ];
  }

  return items;
};

export const CustomSelectKind: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path });
  const [options, setOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

  const offerSource = useFormFields(([fields, _]) => fields.source);

  React.useEffect(() => {
    const tmpOptions = getItemsKind(offerSource?.value as Offer["source"]);
    setOptions(tmpOptions);
  }, [offerSource]);

  return (
    <div className="field-type">
      <label className="field-label">Type</label>
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
