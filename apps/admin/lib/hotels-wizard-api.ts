'use client';

import type { WizardData } from '@/components/hotels/wizard/types';
import { api } from '@/lib/api';
import type { TenantSummary } from '@/lib/types';
import type { AdminPartner } from '@/lib/hotels-wizard-types';

const DRAFTS_KEY = 'kbc_trip_hotel_wizard_drafts';

export type HotelWizardDraft = {
  id: string;
  name: string;
  slug: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function loadDrafts(): HotelWizardDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as HotelWizardDraft[]) : [];
  } catch {
    return [];
  }
}

function saveDrafts(rows: HotelWizardDraft[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(rows));
}

export const adminPartnersApi = {
  async list(_opts?: { limit?: number }): Promise<{ items: AdminPartner[] }> {
    try {
      const tenants = await api.get<TenantSummary[]>('/platform/tenants');
      return {
        items: tenants.map((t) => ({
          id: t.id,
          business_name: t.name,
          business_email: t.ownerEmail ?? '',
          contact_name: t.ownerName ?? undefined,
          email: t.ownerEmail ?? undefined,
          status: t.status,
        })),
      };
    } catch {
      return {
        items: [
          {
            id: 'kbc-platform',
            business_name: 'KBC Trip Platform',
            business_email: 'ops@kbctrip.com',
            contact_name: 'Ops',
            status: 'active',
          },
        ],
      };
    }
  },
};

export const adminPropertiesApi = {
  async createProperty(payload: Record<string, unknown>): Promise<{ id: string; name: string; slug: string }> {
    const name = String(payload.name ?? 'Untitled property');
    let slug = slugify(name) || `property-${Date.now()}`;
    let id = `wiz_${Date.now().toString(36)}`;
    let provisioned = false;

    // Best-effort: provision a real property on a platform tenant (KBC API accepts name).
    // Room types / rates still come from kbc-booking seed or tenant dashboard inventory.
    try {
      const tenants = await api.get<TenantSummary[]>('/platform/tenants');
      const tenantId = payload.partner_id
        ? String(payload.partner_id)
        : tenants.find((t) => t.id !== 'kbc-platform')?.id ?? tenants[0]?.id;
      if (tenantId && tenantId !== 'kbc-platform') {
        const created = await api.post<{ id?: string; name?: string; slug?: string }>(
          `/platform/tenants/${tenantId}/properties`,
          { name },
        );
        if (created?.id) id = created.id;
        if (created?.slug) slug = created.slug;
        if (created?.name) {
          /* keep wizard name as source of truth for local draft */
        }
        provisioned = true;
      }
    } catch {
      /* local draft still saved — run kbc-booking prisma seed for inventory */
    }

    const draft: HotelWizardDraft = {
      id,
      name,
      slug,
      payload: { ...payload, _kbcProvisioned: provisioned },
      createdAt: new Date().toISOString(),
    };
    const drafts = loadDrafts();
    drafts.unshift(draft);
    saveDrafts(drafts.slice(0, 50));
    return { id, name, slug };
  },
};

export function listHotelWizardDrafts() {
  return loadDrafts();
}

/** Map wizard form → create payload shape used by AddPropertyWizard. */
export function wizardDataToPayload(data: WizardData) {
  return {
    name: data.name,
    property_type: data.property_type,
    star_category: data.star_category,
    description: data.description,
    total_rooms: data.total_rooms,
    collection_type: data.collection_type,
    partner_id: data.partner_id,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    landmark: data.landmark,
    amenities: data.amenities,
    tags: data.tags,
    check_in_time: data.check_in_time,
    check_out_time: data.check_out_time,
    cancellation: data.cancellation,
    children: data.children,
    pets: data.pets,
    smoking: data.smoking,
    extra_bed: data.extra_bed,
    early_check_in: data.early_check_in,
    late_check_out: data.late_check_out,
    age_restriction: data.age_restriction,
    alcohol: data.alcohol,
    payment_methods: data.payment_methods,
    contact: {
      phone: data.contact_phone,
      email: data.contact_email,
      whatsapp: data.contact_whatsapp,
      website: data.contact_website,
      gst: data.contact_gst,
    },
    nearby_attractions: data.nearby_attractions,
    bank_details: data.bank_details,
    room_types: data.room_types,
    dining_venues: data.dining_venues,
    photo_categories: data.photo_categories,
    status: 'approved',
  };
}
