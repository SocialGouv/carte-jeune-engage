import { SelectInput, useField, useFormFields } from "payload/components/forms";
import { Offer } from "../payload-types";
import React from "react";

export const getItemsTermsOfUse = (offerKind: Offer["kind"]) => {
  const items: { text: string; slug: string; icon: string }[] = [];

  if (offerKind.startsWith("code")) {
    const defaultCodeItems = [
      {
        text: "Je vais sur le site de l’offre ",
        slug: "use-link",
        icon: "HiLink",
      },
      {
        text: "J’accepte les cookies sur le site du partenaire ",
        slug: "accept-cookies",
        icon: "HiCheckBadge",
      },
    ];

    if (offerKind === "code") {
      items.push(
        { text: "Je copie mon code promo", slug: "copy-code", icon: "FiCopy" },
        ...defaultCodeItems,
        {
          text: "Je colle mon code sur le site du partenaire dès qu'on me le demande",
          slug: "paste-code",
          icon: "FiCopy",
        }
      );
    } else if (offerKind === "code_space") {
      items.push(...defaultCodeItems, {
        text: "Aucun code promo permet de débloquer cette offre",
        slug: "no-code",
        icon: "HiLockClosed",
      });
    }
  } else {
    const defaultVoucherItems = [
      {
        text: "Je vais dans un magasin participant",
        slug: "go-to-store",
        icon: "MdOutlineDirectionsWalk",
      },
      {
        text: "J’achète les articles concernés par l’offre",
        slug: "buy-items",
        icon: "HiShoppingCart",
      },
      {
        text: "Je scanne mon code barre en caisse",
        slug: "scan-barcode",
        icon: "HiReceiptPercent",
      },
      {
        text: "Je présente ma carte CJE en caisse",
        slug: "show-pass",
        icon: "PassIcon",
      },
    ];

    if (offerKind === "voucher") {
      items.push(...defaultVoucherItems);
    } else if (offerKind === "voucher_pass") {
      items.push(
        ...defaultVoucherItems.filter((item) => item.slug !== "scan-barcode")
      );
    }
  }

  return items;
};

export const CustomSelectTermsOfUse: React.FC<{ path: string }> = ({
  path,
}) => {
  const { value, setValue } = useField<string>({ path });
  const [options, setOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

  const offerKind = useFormFields(([fields, _]) => fields.kind);

  React.useEffect(() => {
    const tmpOptions = getItemsTermsOfUse(
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
