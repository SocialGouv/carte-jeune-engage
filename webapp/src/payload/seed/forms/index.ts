import "ignore-styles";
import "dotenv/config";
import { getPayloadClient } from "../../payloadClient";

export const seedData = async () => {
  try {
    const payload = await getPayloadClient({
      seed: true,
    });

    const couponUsedFeedbackForms = await payload.find({
      collection: "forms",
      where: {
        title: {
          equals: "coupon-used-feedback-form",
        },
      },
    });

    if (couponUsedFeedbackForms.docs.length === 0) {
      await payload.create({
        collection: "forms",
        data: {
          title: "coupon-used-feedback-form",
          fields: [
            {
              blockType: "country",
              blockName: "coupon-satisfaction",
              name: "coupon-satisfaction",
              label: "Comment ça s’est passé avec la réduction ?",
              required: true,
              min: 0,
              max: 10,
              iconLegend: [{ icon: "😡" }, { icon: "😐" }, { icon: "😍" }],
              textLegend: [{ label: "Catasrophique" }, { label: "Génial" }],
            },
            {
              blockType: "country",
              blockName: "coupon-complexity",
              name: "coupon-complexity",
              label: "Utiliser la réduction vous avez trouvé ça...",
              required: true,
              min: 0,
              max: 5,
              iconLegend: [{ icon: "🤯" }, { icon: "👌" }],
              textLegend: [
                { label: "Super complexe" },
                { label: "Très simple" },
              ],
            },
            {
              blockType: "textarea",
              blockName: "coupon-text-feedback",
              name: "coupon-text-feedback",
              label: "Que faut-il améliorer selon vous ?",
              placeholder: "Décrivez ce qu’on peut améliorer ici...",
            },
          ] as any,
          confirmationMessage: [{ children: [{ text: "." }] }],
        },
      });
    }

    const orderUsedFeedbackForms = await payload.find({
      collection: "forms",
      where: {
        title: {
          equals: "order-used-feedback-form",
        },
      },
    });

    if (orderUsedFeedbackForms.docs.length === 0) {
      await payload.create({
        collection: "forms",
        data: {
          title: "order-used-feedback-form",
          fields: [
            {
              blockType: "select",
              name: "order-kind",
              label: "Vous l’avez utilisé sur internet ou en boutique ?",
              required: true,
              options: [
                { label: "Sur internet", value: "online" },
                { label: "En boutique", value: "store" },
              ],
            },
            {
              blockType: "country",
              blockName: "order-satisfaction",
              name: "order-satisfaction",
              label: "Comment ça s’est passé avec ce bon d'achat ?",
              required: true,
              min: 0,
              max: 10,
              iconLegend: [{ icon: "😡" }, { icon: "😐" }, { icon: "😍" }],
              textLegend: [{ label: "Catasrophique" }, { label: "Génial" }],
            },
            {
              blockType: "country",
              blockName: "order-complexity",
              name: "order-complexity",
              label: "Utiliser le bon d'achat vous avez trouvé ça...",
              required: true,
              min: 0,
              max: 5,
              iconLegend: [{ icon: "🤯" }, { icon: "👌" }],
              textLegend: [
                { label: "Super complexe" },
                { label: "Très simple" },
              ],
            },
            {
              blockType: "textarea",
              blockName: "order-text-feedback",
              name: "order-text-feedback",
              label: "Que faut-il améliorer selon vous ?",
              placeholder: "Décrivez ce qu’on peut améliorer ici...",
            },
          ] as any,
          confirmationMessage: [{ children: [{ text: "." }] }],
        },
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

seedData();
