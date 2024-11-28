"use client";

import { SelectInput, useField, useFormFields } from "@payloadcms/ui";
import { Offer } from "../payload-types";
import React from "react";

export const getItemsTermsOfUse = (offerKind: Offer["kind"]) => {
  const items: { text: string; slug: string; icon: string }[] = [];

  if (offerKind === "code_obiz") {
    return [
      {
        text: "Choisissez la valeur de votre bon d’achat",
        slug: "code-value",
      },
      {
        text: "Achetez votre bon d’achat avec la réduction",
        slug: "code-buy",
      },
      {
        text: "Votre bon d’achat est disponible dans l’appli",
        slug: "code-inapp",
      },
      {
        text: "Au moment du paiement, vous pouvez payer tout ou une partie avec votre bon d’achat",
        slug: "code-paywith",
      },
    ];
  }

  if (offerKind.startsWith("code")) {
    if (offerKind === "code") {
      items.push(
        {
          text: "Affichez votre code",
          slug: "use-link",
          icon: "HiLink",
        },
        {
          text: "Ouvrez le lien qui se trouve sous votre code",
          slug: "accept-cookies",
          icon: "HiCheckBadge",
        },
        {
          text: "Sur le site du partenaire collez le code au moment où on vous le demande",
          slug: "paste-code",
          icon: "FiCopy",
        }
      );
    } else if (offerKind === "code_space") {
      items.push(
        {
          text: "Affichez votre lien",
          slug: "use-link",
          icon: "HiLink",
        },
        {
          text: "Ouvrez le lien qui s’affiche sous le code",
          slug: "accept-cookies",
          icon: "HiCheckBadge",
        },
        {
          text: "Le lien contient déjà la réduction, pas besoin de code ici",
          slug: "no-code",
          icon: "HiLockClosed",
        }
      );
    }
  } else {
    const defaultVoucherItems = [
      {
        text: "Affichez votre code",
        slug: "go-to-store",
        icon: "MdOutlineDirectionsWalk",
      },
      {
        text: "Rendez-vous dans un magasin participant",
        slug: "buy-items",
        icon: "HiShoppingCart",
      },
    ];

    if (offerKind === "voucher") {
      items.push(
        ...defaultVoucherItems,
        {
          text: "Vérifiez que vos articles sont éligibles à la réduction",
          slug: "check-eligibility",
          icon: "HiReceiptPercent",
        },
        {
          text: "Avant de payer en caisse, scannez votre code",
          slug: "scan-code",
          icon: "PassIcon",
        }
      );
    } else if (offerKind === "voucher_pass") {
      items.push(
        ...defaultVoucherItems,
        {
          text: "Avant de payer en caisse, montrez votre carte virtuelle “jeune engagé”",
          slug: "show-pass",
          icon: "PassIcon",
        },
        {
          text: "La personne en caisse vous fait la réduction",
          slug: "offer-reduction",
          icon: "PassIcon",
        }
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
        onChange={(e) => {
          const option = e as { label: string; value: string };
          setValue(option.value);
        }}
      />
    </div>
  );
};
