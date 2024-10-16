import path from "path";
import { type Payload } from "payload";

export const categories = [
  {
    slug: "shop",
    label: "Courses et restauration",
  },
  {
    slug: "fashion",
    label: "Mode et vêtements",
  },
  {
    slug: "mobility",
    label: "Transport et voyage",
  },
  {
    slug: "hobby",
    label: "Loisirs et sorties",
  },
  {
    slug: "sport",
    label: "Sport",
  },
  {
    slug: "hygiene",
    label: "Hygiène et beauté",
  },
  {
    slug: "equipment",
    label: "High Tech et équipements",
  },
  {
    slug: "culture",
    label: "Livres, presse et culture",
  },
  {
    slug: "bank",
    label: "Banque et assurance",
  },
  {
    slug: "telephony",
    label: "Internet et abonnements",
  },
] as const;

export async function seedCategories(payload: Payload) {
  let createdCategorieIds: number[] = [];

  for (const category of categories) {
    const newMedia = await payload.create({
      collection: "media",
      depth: 0,
      filePath: path.join(
        __dirname,
        `../../../public/images/seeds/categories/${category.slug}.png`
      ),
      data: {
        alt: `${category.slug} icon`,
      },
    });

    const createdCategory = await payload.create({
      collection: "categories",
      data: {
        icon: newMedia.id as number,
        ...category,
      },
    });

    createdCategorieIds.push(createdCategory.id as number);
  }

  await payload.updateGlobal({
    slug: "categories_list",
    data: {
      items: createdCategorieIds.map((id) => ({
        category: id,
      })),
    },
  });
}
