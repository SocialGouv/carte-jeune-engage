import { SelectInput, useField, useFormFields } from "payload/components/forms";
import { Offer } from "../payload-types";
import React from "react";

export const getItemsConditionBlocks = (offerKind: Offer["kind"]) => {
  const items: { text: string; slug: string; icon: string }[] = [];

  let defaultItems = [
    {
      text: "en ligne ou en magasin",
      slug: "use-link-or-go-to-store",
      icon: "HiCursorArrowRays",
    },
    {
      text: "réservé aux nouveaux clients",
      slug: "new-customers",
      icon: "HiUser",
    },
    {
      text: "valable 1 seule fois",
      slug: "one-time",
      icon: "HiMiniEye",
    },
    {
      text: "valable tout le temps",
      slug: "all-time",
      icon: "HiOutlineInformationCircle",
    }
  ]

  if (offerKind.startsWith("code")) {
    items.push(
      { text: "en ligne uniquement", slug: "use-link", icon: "HiCursorArrowRays" },
      ...defaultItems,
    );
  } else {
    items.push(
      { text: "en magasin uniquement", slug: "go-to-store", icon: "HiBuildingStorefront" },
      { text: "uniquement sur certains produits", slug: "specific-products", icon: "HiShoppingCart" },
      ...defaultItems,
    )
  }

  return items;
};

export const CustomSelectConditionBlocks: React.FC<{ path: string }> = ({
  path,
}) => {
  const { value, setValue } = useField<string>({ path });
  const [options, setOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

  const offerKind = useFormFields(([fields, _]) => fields.kind);

  React.useEffect(() => {
    const tmpOptions = getItemsConditionBlocks(
      offerKind?.value as Offer["kind"]
    ).map((item) => ({
      label: item.text,
      value: item.slug,
    }));
    setOptions(tmpOptions);
  }, [offerKind]);

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
