// scripts/generate-fantasy-books.ts
// Correr con: npx ts-node scripts/generate-fantasy-books.ts
import * as fs from 'node:fs';
import * as path from 'node:path';

const OPENLIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
const USER_AGENT = 'LoreVault-Seed/1.0 (contacto: tu-email@ejemplo.com)';

// Mapeo curado: subject crudo de OpenLibrary -> tu categoría interna.
// Andá agregando entradas a medida que veas subjects interesantes en el JSON crudo.
const SUBJECT_CATEGORY_MAP: Record<string, string> = {
  'high fantasy': 'High Fantasy',
  'epic fantasy': 'Epic Fantasy',
  'sword and sorcery': 'Sword & Sorcery',
  'urban fantasy': 'Urban Fantasy',
  'dark fantasy': 'Dark Fantasy',
  dragons: 'Dragons',
  magic: 'Magic',
  wizards: 'Wizards',
  witches: 'Witches',
  'fairy tales': 'Fairy Tales',
  'fantasy fiction': 'Fantasy',
  'young adult fiction': 'Young Adult',
  'juvenile fiction': 'Middle Grade',
};

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  language?: string[];
  cover_i?: number;
  subject?: string[];
  ratings_average?: number;
}

interface SeedProduct {
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
  tags: string[];
  rating: number;
  reviews: number;
  isActive?: boolean;
  attributes: Record<string, any>;
  categories?: { name: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapCategories(subjects: string[] = []): string[] {
  const matched = new Set<string>();
  for (const raw of subjects) {
    const key = raw.toLowerCase().trim();
    if (SUBJECT_CATEGORY_MAP[key]) matched.add(SUBJECT_CATEGORY_MAP[key]);
  }
  if (matched.size === 0) matched.add('Fantasy'); // fallback
  return Array.from(matched);
}

function randomPrice(): number {
  return Math.round((Math.random() * (25 - 8) + 8) * 100) / 100;
}

function randomStock(): number {
  return Math.floor(Math.random() * 150) + 10;
}

function randomBestseller(probability = 0.25): boolean {
  return Math.random() < probability;
}

async function fetchPage(offset: number, limit: number): Promise<OpenLibraryDoc[]> {
  const fields = [
    'key', 'title', 'author_name', 'first_publish_year',
    'isbn', 'language', 'cover_i', 'subject', 'ratings_average',
  ].join(',');
  const url = `${OPENLIBRARY_SEARCH_URL}?q=subject:fantasy&fields=${fields}&limit=${limit}&offset=${offset}`;

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`OpenLibrary request falló: ${res.status}`);
  const data = await res.json();
  return data.docs ?? [];
}

function toSeedProduct(doc: OpenLibraryDoc): SeedProduct | null {
  if (!doc.title || !doc.author_name?.length) return null;

  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : null;

  const categories = mapCategories(doc.subject).map((name) => ({ name }));

  return {
    title: doc.title,
    description: `${doc.title}, de ${doc.author_name[0]}.`,
    stock: randomStock(),
    price: randomPrice(),
    images: coverUrl ? [coverUrl] : [],
    tags: categories.map((c) => c.name),
    rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 4.0,
    reviews: Math.floor(Math.random() * 5000),
    isActive: true,
    attributes: {
      author: doc.author_name[0],
      isbn: doc.isbn?.[0] ?? null,
      language: doc.language?.[0] ?? 'eng',
      publishYear: doc.first_publish_year ?? null,
      isBestseller: randomBestseller(),
    },
    categories,
  };
}

async function main() {
  const seen = new Set<string>();
  const results: SeedProduct[] = [];
  const PAGE_SIZE = 100;
  const MAX_PAGES = 20; // 20 * 100 = hasta 2000 libros, ajustá a gusto

  for (let page = 0; page < MAX_PAGES; page++) {
    const docs = await fetchPage(page * PAGE_SIZE, PAGE_SIZE);
    if (docs.length === 0) break;

    for (const doc of docs) {
      const product = toSeedProduct(doc);
      if (!product) continue;

      const dedupeKey = slugify(product.title);
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      results.push(product);
    }

    console.log(`Página ${page + 1}: ${docs.length} recibidos, ${results.length} acumulados`);
    await new Promise((r) => setTimeout(r, 250)); // no hostigar a la API
  }

  const outputPath = path.join(__dirname, '../src/seed/data/openlibrary-fantasy.data.ts');
  const fileContent = `// Auto-generado por scripts/generate-fantasy-books.ts — no editar a mano
export const openLibraryFantasyBooks = ${JSON.stringify(results, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log(`Listo: ${results.length} libros escritos en ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});