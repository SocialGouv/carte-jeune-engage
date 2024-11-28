import path from "path";
import { type Payload } from "payload";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const tags = [
  {
    slug: "sport_equipment",
    label: "Equipement sport",
  },
  {
    slug: "graphic_tablet",
    label: "Une tablette graphique",
  },
  {
    slug: "grocery",
    label: "Courses alimentaires",
  },
  {
    slug: "clothes",
    label: "Vêtements",
  },
  {
    slug: "shoes",
    label: "Chaussures",
  },
  {
    slug: "computer",
    label: "Un ordinateur",
  },
  {
    slug: "bike",
    label: "Trotinette / vélo elect.",
  },
  {
    slug: "license",
    label: "Permis de conduire",
  },
  {
    slug: "desk_equipment",
    label: "Equipement bureau",
  },
  {
    slug: "phone",
    label: "Un smartphone",
  },
  {
    slug: "trip",
    label: "Voyage",
  },
  {
    slug: "washing_machine",
    label: "Machine à laver",
  },
  {
    slug: "books",
    label: "Livres",
  },
  {
    slug: "culture",
    label: "Sorties et loisirs",
  },
  {
    slug: "phone_plan",
    label: "Forfaits téléphone",
  },
  {
    slug: "bank_and_insurance",
    label: "Banque et assurance",
  },
] as const;

export async function seedTags(payload: Payload) {
  let createdTagIds: number[] = [];

  for (const tag of tags) {
    const newMedia = await payload.create({
      collection: "media",
      depth: 0,
      filePath: path.join(
        __dirname,
        `../../../public/images/seeds/tags/${tag.slug}.png`
      ),
      data: {
        alt: `${tag.slug} icon`,
      },
    });

    const createdTag = await payload.create({
      collection: "tags",
      data: {
        icon: newMedia.id as number,
        ...tag,
      },
    });

    createdTagIds.push(createdTag.id as number);
  }

  await payload.updateGlobal({
    slug: "tags_list",
    data: {
      items: createdTagIds.map((id) => ({
        tag: id,
      })),
    },
  });
}
