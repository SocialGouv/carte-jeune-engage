import { SelectInput, useField, useFormFields } from "payload/components/forms";
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
    const defaultCodeItems = [
      {
        text: 'Cliquez sur "Voir le code"',
        slug: "use-link",
        icon: "HiLink",
      },
      {
        text: "On vous emmène sur le bon site",
        slug: "accept-cookies",
        icon: "HiCheckBadge",
      },
    ];

    if (offerKind === "code") {
      items.push(...defaultCodeItems, {
        text: "Dès qu’il faut mettre le code carte <strong>“jeune engagé”</strong> on vous prévient 🙂",
        slug: "paste-code",
        icon: "FiCopy",
      });
    } else if (offerKind === "code_space") {
      items.push(...defaultCodeItems, {
        text: "Vous n’avez plus qu’à acheter ce qu’il vous faut",
        slug: "no-code",
        icon: "HiLockClosed",
      });
    }
  } else {
    const defaultVoucherItems = [
      {
        text: "Cliquez sur “Voir le code”",
        slug: "go-to-store",
        icon: "MdOutlineDirectionsWalk",
      },
      {
        text: "Rendez-vous dans un des magasins participants",
        slug: "buy-items",
        icon: "HiShoppingCart",
      },
      {
        text: "Achetez les articles correspondants à la réduction",
        slug: "scan-barcode",
        icon: "HiReceiptPercent",
      },
      {
        text: "Au moment de payer, scannez votre code barre en caisse",
        slug: "show-pass",
        icon: "PassIcon",
      },
    ];

    if (offerKind === "voucher") {
      items.push(...defaultVoucherItems);
    } else if (offerKind === "voucher_pass") {
      items.push(
        ...defaultVoucherItems.filter((item) => item.slug === "buy-items"),
        {
          text: 'Cliquez sur <strong>"présenter ma carte"</strong>',
          slug: "show-pass",
          icon: "PassIcon",
        },
        {
          text: "La personne en caisse vous offre la réduction",
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
        onChange={(e) => setValue(e.value)}
      />
    </div>
  );
};
