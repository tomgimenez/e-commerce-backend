import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../../user/enums/valid-roles';
import { productsData } from './products-data';
import { ProductType } from 'src/product-type/entities/product-types.entity';

interface SeedProduct {
	title: string;
	description: string;
	stock: number;
	price: number;
	slug?: string;
	images: string[];
	tags: string[];
	rating: number;
	reviews: number;
	isActive?: boolean;
	attributes: Record<string, any>;
	categories?: SeedCategory[];
}

interface SeedUser {
	email:    string;
	name: string;
	lastname: string;
	password: string;
	roles:     string[];
	addresses?: any[];
}

interface SeedProductType {
	name: string;
	slug: string;
	schema: Record<string, any>;
}

interface SeedShippingMethod {
	name: string;
	description: string;
	price: number;
	is_active?: boolean;
	sort_order: number;
}

interface SeedTax {
	name: string;
	rate: number;
	is_active?: boolean;
	sort_order: number;
}

interface SeedData {
	users: SeedUser[];
	categories: SeedCategory[];
	productType: SeedProductType;
	products: SeedProduct[];
	shippingMethods: SeedShippingMethod[];
	taxes: SeedTax[];
}

export interface SeedCategory {
  name: string;
  children?: SeedCategory[];
	productType?: ProductType;
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
			name: 'Admin User',
			lastname: 'User',
			password: bcrypt.hashSync( 'Abc123', 10 ),
			roles: [ValidRoles.admin],
			addresses: [
				{
					name: 'Admin Headquarters',
					street: 'Av. Siempre Viva',
					number: '742',
					floor: '1',
					apartment: 'A',
					between_streets: 'Falsa 2 y Falsa 4',
					notes: 'Dirección administrativa para el usuario admin',
					city: 'Springfield',
					state: 'Buenos Aires',
					zip_code: '5000',
					country: 'Argentina',
					is_default: true,
				}
			]
		},
		{
			email: 'user@google.com',
			name: 'Shop User',
			lastname: 'User',
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

	products: productsData,

	shippingMethods: [
		{
			name: 'Free Shipping',
			description: '7-10 business days',
			price: 0,
			is_active: true,
			sort_order: 1,
		},
		{
			name: 'Standard Shipping',
			description: '3-5 business days',
			price: 4.99,
			is_active: true,
			sort_order: 2,
		},
		{
			name: 'Express Shipping',
			description: '1-2 business days',
			price: 9.99,
			is_active: true,
			sort_order: 3,
		},
	],

	taxes: [
		{
			name: 'IVA',
			rate: 0.21,
			is_active: true,
			sort_order: 1,
		},
	],
}