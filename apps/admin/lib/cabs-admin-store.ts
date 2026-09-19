'use client';

export type AdminCab = {
  id: string;
  name: string;
  slug?: string;
  cab_category: string;
  seating_capacity: number;
  luggage_capacity: number;
  is_ac: boolean;
  is_active: boolean;
  is_featured: boolean;
  features: string[];
  service_types: string[];
  fuel_type?: string;
  permit_type?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_whatsapp?: string;
  driver_license?: string;
  driver_pan?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  registration_number?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_year?: number | null;
  base_city?: string;
  vehicle_notes?: string;
  featured_image?: string;
  gallery_images: string[];
  pricing?: Record<string, number | string>;
  created_at: string;
  updated_at: string;
};

const KEY = 'kbc_trip_admin_cabs';

function read(): AdminCab[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminCab[]) : [];
  } catch {
    return [];
  }
}

function write(rows: AdminCab[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export const cabTypesApi = {
  async list(opts?: {
    page?: number;
    limit?: number;
    search?: string;
    cab_category?: string;
  }): Promise<{ items: AdminCab[]; total: number }> {
    let items = read();
    const q = opts?.search?.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.base_city ?? '').toLowerCase().includes(q) ||
          (c.registration_number ?? '').toLowerCase().includes(q),
      );
    }
    if (opts?.cab_category) {
      items = items.filter((c) => c.cab_category === opts.cab_category);
    }
    const total = items.length;
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  },

  async get(id: string): Promise<AdminCab | null> {
    return read().find((c) => c.id === id) ?? null;
  },

  async create(input: Partial<AdminCab>): Promise<AdminCab> {
    const now = new Date().toISOString();
    const cab: AdminCab = {
      id: `cab_${Date.now().toString(36)}`,
      name: input.name ?? 'Untitled cab',
      cab_category: input.cab_category ?? 'sedan',
      seating_capacity: input.seating_capacity ?? 4,
      luggage_capacity: input.luggage_capacity ?? 2,
      is_ac: input.is_ac ?? true,
      is_active: input.is_active ?? false,
      is_featured: input.is_featured ?? false,
      features: input.features ?? [],
      service_types: input.service_types ?? [],
      fuel_type: input.fuel_type,
      permit_type: input.permit_type,
      driver_name: input.driver_name,
      driver_phone: input.driver_phone,
      driver_whatsapp: input.driver_whatsapp,
      driver_license: input.driver_license,
      driver_pan: input.driver_pan,
      owner_name: input.owner_name,
      owner_phone: input.owner_phone,
      owner_email: input.owner_email,
      registration_number: input.registration_number,
      vehicle_model: input.vehicle_model,
      vehicle_color: input.vehicle_color,
      vehicle_year: input.vehicle_year ?? null,
      base_city: input.base_city,
      vehicle_notes: input.vehicle_notes,
      featured_image: input.featured_image,
      gallery_images: input.gallery_images ?? [],
      pricing: input.pricing,
      created_at: now,
      updated_at: now,
    };
    const rows = read();
    rows.unshift(cab);
    write(rows);
    return cab;
  },

  async update(id: string, patch: Partial<AdminCab>): Promise<AdminCab> {
    const rows = read();
    const idx = rows.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Cab not found');
    rows[idx] = { ...rows[idx], ...patch, updated_at: new Date().toISOString() };
    write(rows);
    return rows[idx];
  },

  async delete(id: string): Promise<void> {
    write(read().filter((c) => c.id !== id));
  },
};

export const cabPricingApi = {
  async get(cabId: string): Promise<Record<string, number | string>> {
    const cab = await cabTypesApi.get(cabId);
    return cab?.pricing ?? {};
  },
  async save(cabId: string, pricing: Record<string, number | string>): Promise<void> {
    await cabTypesApi.update(cabId, { pricing });
  },
};
