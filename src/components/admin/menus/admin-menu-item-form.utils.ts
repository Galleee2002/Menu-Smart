import type { MenuItem } from '../../../lib/admin-api';

export type ItemFormState = {
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string;
  categoryId: string;
};

function parseAllergens(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function toItemFormState(item: MenuItem): ItemFormState {
  return {
    name: item.name,
    description: item.description,
    price: item.price,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    allergens: item.allergens.join(', '),
    categoryId: item.categoryId,
  };
}

export function emptyItemFormState(categoryId: string): ItemFormState {
  return {
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    isFeatured: false,
    allergens: '',
    categoryId,
  };
}

export function buildItemPayload(form: ItemFormState): {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
} {
  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number.parseFloat(form.price),
    isAvailable: form.isAvailable,
    isFeatured: form.isFeatured,
    allergens: parseAllergens(form.allergens),
  };
}

export function buildItemPatch(
  form: ItemFormState,
  original: ItemFormState,
): Record<string, string | number | boolean | string[]> | null {
  const patch: Record<string, string | number | boolean | string[]> = {};
  const payload = buildItemPayload(form);
  const originalPayload = buildItemPayload(original);

  if (payload.name !== originalPayload.name) {
    patch.name = payload.name;
  }

  if (payload.description !== originalPayload.description) {
    patch.description = payload.description;
  }

  if (payload.price !== originalPayload.price) {
    patch.price = payload.price;
  }

  if (payload.isAvailable !== originalPayload.isAvailable) {
    patch.isAvailable = payload.isAvailable;
  }

  if (payload.isFeatured !== originalPayload.isFeatured) {
    patch.isFeatured = payload.isFeatured;
  }

  if (payload.categoryId !== originalPayload.categoryId) {
    patch.categoryId = payload.categoryId;
  }

  const allergensChanged =
    payload.allergens.length !== originalPayload.allergens.length ||
    payload.allergens.some((allergen, index) => allergen !== originalPayload.allergens[index]);

  if (allergensChanged) {
    patch.allergens = payload.allergens;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function validateItemForm(
  form: ItemFormState,
): Partial<Record<keyof ItemFormState, string>> {
  const errors: Partial<Record<keyof ItemFormState, string>> = {};
  const trimmedName = form.name.trim();
  const trimmedDescription = form.description.trim();
  const price = Number.parseFloat(form.price);

  if (trimmedName.length < 1 || trimmedName.length > 150) {
    errors.name = 'El nombre debe tener entre 1 y 150 caracteres.';
  }

  if (trimmedDescription.length > 1000) {
    errors.description = 'La descripción no puede superar 1000 caracteres.';
  }

  if (!Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100) {
    errors.price = 'Introduce un precio válido con máximo 2 decimales.';
  }

  const allergens = parseAllergens(form.allergens);

  if (allergens.some((allergen) => allergen.length > 50)) {
    errors.allergens = 'Cada alérgeno debe tener entre 1 y 50 caracteres.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Selecciona una categoría.';
  }

  return errors;
}

export function parseAllergensForPreview(value: string): string[] {
  return parseAllergens(value);
}
