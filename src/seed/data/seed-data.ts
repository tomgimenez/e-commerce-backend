import * as bcrypt from 'bcrypt';
import { ValidRoles } from 'src/auth/interfaces';
import { productsData } from './products-data';

interface SeedProduct {
	description: string;
	images: string[];
	stock: number;
	price: number;
	tags: string[];
	title: string;
	rating: number;
	reviews: number;
	attributes: Record<string, any>;
	categories?: SeedCategory[];
}

interface SeedUser {
	email:    string;
	fullName: string;
	password: string;
	roles:     string[];
}

interface SeedProductType {
	name: string;
	slug: string;
	schema: Record<string, any>;
}

interface SeedData {
	users: SeedUser[];
	categories: SeedCategory[];
	productType: SeedProductType;
	products: SeedProduct[];
}

export interface SeedCategory {
  name: string;
  children?: SeedCategory[];
}

const seedCategories: SeedCategory[] = [
  {
    name: 'Fantasy',
    children: [
      {
        name: 'High Fantasy',
        children: [
          { name: 'Epic Fantasy' },
          { name: 'Heroic Fantasy' },
        ],
      },
      {
        name: 'Low Fantasy',
        children: [
          { name: 'Grimdark' },
          { name: 'Historical Fantasy' },
          { name: 'Magical Realism' },
        ],
      },
      {
        name: 'Contemporary Fantasy',
        children: [
          { name: 'Urban Fantasy' },
          { name: 'Portal Fantasy' },
          { name: 'Gaslamp Fantasy' },
        ],
      },
      {
        name: 'Genre Blends',
        children: [
          { name: 'Romantic Fantasy' },
          { name: 'LitRPG' },
          { name: 'Wuxia / Xianxia' },
        ],
      },
    ],
  },
];


export const initialData: SeedData = {

	users: [
		{
			email: 'admin@google.com',
			fullName: 'Admin User',
			password: bcrypt.hashSync( 'Abc123', 10 ),
			roles: [ValidRoles.admin]
		},
		{
			email: 'user@google.com',
			fullName: 'Shop User',
			password: bcrypt.hashSync( 'Abc123', 10 ),
			roles: [ValidRoles.user, ValidRoles.superUser]
		}
	],

	categories: seedCategories,

	productType: {
		name: 'Book',
		slug: 'book',
		schema: {
			author: {
				type: 'string',
				required: true,
				label: 'Author'
			},
			publisher: {
				type: 'string',
				required: false,
				label: 'Publisher'
			},
			isBestseller: {
				type: 'boolean',
				required: false,
				label: 'Bestseller'
			},
			pages: {
				type: 'string',
				required: false,
				label: 'Pages'
			}
		},
	},

	products: productsData
}