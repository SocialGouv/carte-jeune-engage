import path from "path";
import { type Payload } from "payload";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const partners = [
  {
    name: "Cora",
    description: "Description de Cora",
    color: "#283F93",
    url: "https://www.cora.fr/",
  },
  {
    name: "Lidl",
    description: "Description de Lidl",
    color: "#FFF000",
    url: "https://www.lidl.fr/",
  },
  {
    name: "Auchan",
    description: "Description de Auchan",
    color: "#E0001A",
    url: "https://www.auchan.fr/",
  },
  {
    name: "Flixbus",
    description: "Description de Flixbus",
    color: "#73D700",
    url: "https://www.flixbus.fr/",
  },
] as const;

export async function seedPartners(payload: Payload) {
  for (const partner of partners) {
    const newMedia = await payload.create({
      collection: "media",
      filePath: path.join(
        __dirname,
        `../../../public/images/seeds/partners/${partner.name.toLowerCase()}.svg`
      ),
      data: {
        alt: `${partner.name.toLowerCase()} icon`,
      },
    });

    await payload.create({
      collection: "partners",
      data: {
        icon: newMedia.id,
        ...partner,
      },
    });
  }
}
