import { type CollectionConfig } from "payload/types";

export const Permissions: CollectionConfig = {
	slug: "permissions",
	labels: {
		singular: "Autorisation",
		plural: "Autorisations",
	},
	admin: {
		useAsTitle: "phone_number",
	},
	fields: [
		{
			name: "phone_number",
			type: "text",
			unique: true,
			label: "Téléphone",
		},
	],
};
