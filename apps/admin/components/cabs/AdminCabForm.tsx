"use client";
/**
 * src/components/admin/cabs/AdminCabForm.tsx
 *
 * Same 4-step form as ops CabForm but:
 * - Uses admin upload endpoint (/admin/v1/cabs/upload-photo via uploadFetch)
 * - Admin token auth (not ops token)
 * - Orange accent palette (tokens.orange) instead of gold
 *
 * Step 1 — Owner & Driver
 * Step 2 — Vehicle Details
 * Step 3 — Cities & Photos
 * Step 4 — Website Pricing
 */

import { useState, FormEvent } from 'react'
async function uploadAdminCabPhoto(file: File, _category = 'gallery'): Promise<{ url: string }> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
  return { url }
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#F9F5EF", surface: "#FFFFFF", surface2: "#F4F1EB",
  border: "#D4CFC5", border2: "#B8B2A7",
  accent: "#E8620A", accentDim: "#C44E00", accentBg: "#FFF3ED",
  text: "#1C1917", muted: "#57534E", dim: "#8C8078",
  green: "#15803D", greenBg: "#F0FDF4", greenBd: "#86EFAC",
  red: "#B91C1C", redBg: "#FEF2F2", redBd: "#FECACA",
  amber: "#B45309", amberBg: "#FFFBEB", amberBd: "#FCD34D",
  blue: "#1D4ED8", blueBg: "#EFF6FF", blueBd: "#93C5FD",
};

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "hatchback",       label: "Hatchback",       icon: "🚗" },
  { value: "sedan",           label: "Sedan",           icon: "🚗" },
  { value: "suv",             label: "SUV",             icon: "🚙" },
  { value: "muv",             label: "MUV",             icon: "🚐" },
  { value: "xuv",             label: "XUV / 7-Seater",  icon: "🚙" },
  { value: "innova",          label: "Innova Crysta",   icon: "🚙" },
  { value: "ertiga",          label: "Ertiga",          icon: "🚐" },
  { value: "tempo_traveller", label: "Tempo Traveller", icon: "🚌" },
  { value: "mini_bus",        label: "Mini Bus",        icon: "🚍" },
  { value: "bus",             label: "Bus (35+ seats)", icon: "🚌" },
  { value: "luxury",          label: "Luxury",          icon: "🏎️" },
  { value: "electric",        label: "Electric",        icon: "⚡" },
];
const FUEL_TYPES   = ["petrol", "diesel", "cng", "electric", "hybrid"];
const PERMIT_TYPES = [
  { value: "all_india", label: "All India" },
  { value: "state",     label: "State" },
  { value: "tourist",   label: "Tourist" },
];
const CAB_FEATURES  = ["GPS", "Music System", "Reclining Seats", "Charging Points", "First Aid Kit", "Bottle Water", "Blanket"];
const SERVICE_TYPES = [
  { value: "point_to_point",  label: "Point to Point" },
  { value: "full_day_rental", label: "Full Day Rental" },
  { value: "airport_transfer",label: "Airport Transfer" },
  { value: "multi_day",       label: "Multi Day" },
];
const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const TRIP_RATE_ROWS: { key: string; label: string; unit: string; note?: string }[] = [
  { key: "oneway_local",    label: "One-Way Local",         unit: "₹/km" },
  { key: "oneway_out",      label: "One-Way Outstation",    unit: "₹/km", note: "billed at actual km × 2" },
  { key: "roundtrip_local", label: "Round Trip Local",      unit: "₹/km" },
  { key: "roundtrip_out",   label: "Round Trip Outstation", unit: "₹/km" },
  { key: "fullday_local",   label: "Full Day Local",        unit: "₹/day" },
  { key: "fullday_out",     label: "Full Day Outstation",   unit: "₹/day" },
];

const STEPS = [
  { label: "Owner & Driver",  icon: "👤" },
  { label: "Vehicle Details", icon: "🚗" },
  { label: "Cities & Photos", icon: "📍" },
  { label: "Website Pricing", icon: "💰" },
] as const;

// ── Style helpers ─────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.border2}`, background: C.surface,
  color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", transition: "border-color 0.15s",
};
const lbl: React.CSSProperties  = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 5 };
const secTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
  letterSpacing: "0.1em", color: C.accentDim, marginBottom: 16,
  paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
};
const g2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const g3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
const g4: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 };
const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = C.accent;
  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.15)`;
};
const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "none";
};
const chip = (on: boolean, color = C.accent): React.CSSProperties => ({
  padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600,
  cursor: "pointer", border: "1.5px solid",
  borderColor: on ? color : C.border,
  background: on ? (color === C.green ? C.greenBg : C.accentBg) : C.surface,
  color: on ? (color === C.green ? C.green : C.accentDim) : C.muted,
  transition: "all 0.12s",
});
const selling = (net: number, margin: number) => +(net * (1 + margin / 100)).toFixed(2);

// ── Types ─────────────────────────────────────────────────────────────────────
type OwnerDriverState = {
  // Owner
  owner_name: string; owner_phone: string; owner_email: string;
  // Driver
  driver_name: string; driver_phone: string; driver_whatsapp: string;
  driver_license: string; driver_pan: string;
};

type VehicleState = {
  // Specs
  name: string; category: string; seats: number; luggage_capacity: number;
  fuel_type: string; ac: boolean; permit_type: string;
  features: string[]; service_types: string[]; is_featured: boolean;
  // Physical vehicle info (moved here from Owner/Driver)
  registration_number: string; vehicle_model: string; vehicle_color: string;
  vehicle_year: number; base_city: string; vehicle_notes: string;
};

type PricingState = {
  oneway_local_net: number;    oneway_local_margin: number;
  oneway_out_net: number;      oneway_out_margin: number;
  roundtrip_local_net: number; roundtrip_local_margin: number;
  roundtrip_out_net: number;   roundtrip_out_margin: number;
  fullday_local_net: number;   fullday_local_margin: number;
  fullday_out_net: number;     fullday_out_margin: number;
  fullday_included_km: number; fullday_included_hrs: number;
  extra_km_net: number;        extra_km_margin: number;
  extra_hr_net: number;        extra_hr_margin: number;
  offseason_multiplier: number; driver_allowance_per_night: number; night_charge: number;
};
export interface AdminCabFormData {
  ownerDriver: OwnerDriverState;
  vehicle:     VehicleState;
  cities:      { city: string; state: string }[];
  photos:      { featured_image: string; gallery_images: string[] };
  pricing:     PricingState;
}

interface Props {
  initial?:         any;
  initialPricing?:  any | null;
  onSubmit: (data: AdminCabFormData) => Promise<void>;
  loading:  boolean;
  isEdit?:  boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCabForm({ initial, initialPricing, onSubmit, loading, isEdit }: Props) {
  const [step, setStep]     = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Step 1: Owner & Driver
  const [od, setOd] = useState<OwnerDriverState>({
    owner_name:      initial?.owner_name      || "",
    owner_phone:     initial?.owner_phone     || "",
    owner_email:     initial?.owner_email     || "",
    driver_name:     initial?.driver_name     || "",
    driver_phone:    initial?.driver_phone    || "",
    driver_whatsapp: initial?.driver_whatsapp || "",
    driver_license:  initial?.driver_license  || "",
    driver_pan:      "",  // never pre-fill PAN
  });

  // Step 2: Vehicle Details
  const [veh, setVeh] = useState<VehicleState>({
    name:                initial?.name                || "",
    category:            initial?.cab_category            || "sedan",
    seats:               initial?.seating_capacity               || 4,
    luggage_capacity:    initial?.luggage_capacity    || 2,
    fuel_type:           initial?.fuel_type           || "diesel",
    ac:                  initial?.is_ac                  ?? true,
    permit_type:         initial?.permit_type         || "all_india",
    features:            initial?.features            || [],
    service_types:       initial?.service_types       || [],
    is_featured:         initial?.is_featured         || false,
    registration_number: initial?.registration_number || "",
    vehicle_model:       initial?.vehicle_model       || "",
    vehicle_color:       initial?.vehicle_color       || "",
    vehicle_year:        initial?.vehicle_year        || new Date().getFullYear(),
    base_city:           initial?.base_city           || "",
    vehicle_notes:       initial?.vehicle_notes       || "",
  });

  // Step 3: Cities & Photos
  const [cities, setCities]             = useState<{ city: string; state: string }[]>(
    initial?.cities?.length ? initial.cities : [{ city: "", state: "" }]
  );
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(initial?.gallery_images || []);

  // Step 4: Pricing
  const [pricing, setPricing] = useState<PricingState>({
    oneway_local_net:    initialPricing?.oneway_local_net    || 0,
    oneway_local_margin: initialPricing?.oneway_local_margin || 25,
    oneway_out_net:      initialPricing?.oneway_out_net      || 0,
    oneway_out_margin:   initialPricing?.oneway_out_margin   || 25,
    roundtrip_local_net:    initialPricing?.roundtrip_local_net    || 0,
    roundtrip_local_margin: initialPricing?.roundtrip_local_margin || 25,
    roundtrip_out_net:      initialPricing?.roundtrip_out_net      || 0,
    roundtrip_out_margin:   initialPricing?.roundtrip_out_margin   || 25,
    fullday_local_net:    initialPricing?.fullday_local_net    || 0,
    fullday_local_margin: initialPricing?.fullday_local_margin || 25,
    fullday_out_net:      initialPricing?.fullday_out_net      || 0,
    fullday_out_margin:   initialPricing?.fullday_out_margin   || 25,
    fullday_included_km:  initialPricing?.fullday_included_km  || 80,
    fullday_included_hrs: initialPricing?.fullday_included_hrs || 8,
    extra_km_net:         initialPricing?.extra_km_net         || 0,
    extra_km_margin:      initialPricing?.extra_km_margin      || 25,
    extra_hr_net:         initialPricing?.extra_hr_net         || 0,
    extra_hr_margin:      initialPricing?.extra_hr_margin      || 25,
    offseason_multiplier:       initialPricing?.offseason_multiplier       || 0.85,
    driver_allowance_per_night: initialPricing?.driver_allowance_per_night || 300,
    night_charge:               initialPricing?.night_charge               || 0,
  });

  // Helpers
  function setO<K extends keyof OwnerDriverState>(k: K, v: OwnerDriverState[K]) { setOd(f => ({ ...f, [k]: v })); }
  function setV<K extends keyof VehicleState>(k: K, v: VehicleState[K]) { setVeh(f => ({ ...f, [k]: v })); }

  function toggleFeature(f: string) {
    setV("features", veh.features.includes(f) ? veh.features.filter(x => x !== f) : [...veh.features, f]);
  }
  function toggleService(s: string) {
    setV("service_types", veh.service_types.includes(s) ? veh.service_types.filter(x => x !== s) : [...veh.service_types, s]);
  }

  function addCity()  { setCities(c => [...c, { city: "", state: "" }]); }
  function removeCity(i: number) { setCities(c => c.filter((_, j) => j !== i)); }
  function updateCity(i: number, key: "city" | "state", val: string) {
    setCities(c => c.map((x, j) => j === i ? { ...x, [key]: val } : x));
  }
  function validate(idx: number): string[] {
    const e: string[] = [];
    if (idx === 1) {  // Vehicle Details
      if (!veh.name.trim()) e.push("Vehicle name is required.");
      if (!veh.category)    e.push("Category is required.");
      if (veh.seats < 1)    e.push("Seating capacity must be at least 1.");
    }
    if (idx === 2) {  // Cities
      const filled = cities.filter(c => c.city.trim() && c.state.trim());
      if (filled.length === 0) e.push("Add at least 1 operating city with state.");
      if (cities.some(c => (c.city.trim() && !c.state.trim()) || (!c.city.trim() && c.state.trim())))
        e.push("Every city row needs both city name and state.");
    }
    return e;
  }

  function next() {
    const errs = validate(step);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]); setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() { setErrors([]); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    await onSubmit({
      ownerDriver: od,
      vehicle:     veh,
      cities:      cities.filter(c => c.city.trim() && c.state.trim()),
      photos:      { featured_image: featuredImage, gallery_images: galleryImages },
      pricing,
    });
  }

  const isLast = step === STEPS.length - 1;

  return (
    <form onSubmit={submit} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>

      {/* Step tabs */}
      <div style={{ background: C.surface2, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {STEPS.map((s, i) => (
          <button key={i} type="button"
            onClick={() => { if (i < step) { setErrors([]); setStep(i); } }}
            style={{
              padding: "13px 18px", border: "none", background: "none",
              cursor: i <= step ? "pointer" : "default", fontSize: 13,
              fontWeight: i === step ? 700 : 500, whiteSpace: "nowrap",
              borderBottom: `3px solid ${i === step ? C.accent : "transparent"}`,
              color: i === step ? C.accentDim : i < step ? C.green : C.dim,
              display: "flex", alignItems: "center", gap: 7, flexShrink: 0,
            }}>
            <span style={{ fontSize: 15 }}>{s.icon}</span>
            {i + 1}. {s.label}
            {i < step && <span style={{ color: C.green }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: C.border }}>
        <div style={{ height: "100%", background: C.accent, width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width 0.35s ease" }} />
      </div>

      {/* Error bar */}
      {errors.length > 0 && (
        <div style={{ padding: "12px 24px", background: C.redBg, borderBottom: `1px solid ${C.redBd}` }}>
          {errors.map((e, i) => <div key={i} style={{ fontSize: 13, color: C.red }}>⚠ {e}</div>)}
        </div>
      )}

      <div style={{ padding: "28px 28px 20px" }}>

        {/* ══ STEP 1 — OWNER & DRIVER ══ */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Owner */}
            <div>
              <div style={secTitle}>Owner / Vendor Contact</div>
              <div style={{ padding: "10px 14px", background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 7, fontSize: 12, color: C.amber, marginBottom: 16 }}>
                💡 Fleet owner or vendor contact — used by admin for coordination. Optional but recommended.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>Owner / Business Name</label>
                  <input style={inp} value={od.owner_name} onChange={e => setO("owner_name", e.target.value)}
                    placeholder="e.g. Sharma Travels Pvt Ltd" onFocus={onF} onBlur={onB} />
                </div>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input style={inp} type="tel" value={od.owner_phone} onChange={e => setO("owner_phone", e.target.value)}
                      placeholder="+91 98765 43210" onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>Email</label>
                    <input style={inp} type="email" value={od.owner_email} onChange={e => setO("owner_email", e.target.value)}
                      placeholder="owner@travels.com" onFocus={onF} onBlur={onB} />
                  </div>
                </div>
              </div>
            </div>

            {/* Driver */}
            <div>
              <div style={secTitle}>Driver Details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Driver Name</label>
                    <input style={inp} value={od.driver_name} onChange={e => setO("driver_name", e.target.value)}
                      placeholder="Full name" onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>Driver Phone</label>
                    <input style={inp} type="tel" value={od.driver_phone} onChange={e => setO("driver_phone", e.target.value)}
                      placeholder="+91 98765 43210" onFocus={onF} onBlur={onB} />
                  </div>
                </div>
                <div style={g2}>
                  <div>
                    <label style={lbl}>WhatsApp</label>
                    <input style={inp} type="tel" value={od.driver_whatsapp} onChange={e => setO("driver_whatsapp", e.target.value)}
                      placeholder="+91 98765 43210" onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>License Number</label>
                    <input style={inp} value={od.driver_license} onChange={e => setO("driver_license", e.target.value)}
                      placeholder="HR0320190012345" onFocus={onF} onBlur={onB} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>PAN Number</label>
                  <input style={inp} value={od.driver_pan} onChange={e => setO("driver_pan", e.target.value)}
                    placeholder="ABCDE1234F — stored encrypted, never shown again" onFocus={onF} onBlur={onB} />
                  <p style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>🔒 Stored with AES-256-GCM encryption. Leave blank to skip.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — VEHICLE DETAILS ══ */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Specs */}
            <div>
              <div style={secTitle}>Vehicle Specifications</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={lbl}>Vehicle Name <span style={{ color: C.accent }}>*</span></label>
                  <input style={inp} value={veh.name} onChange={e => setV("name", e.target.value)}
                    placeholder="e.g. Toyota Innova Crysta" onFocus={onF} onBlur={onB} />
                </div>

                <div>
                  <label style={lbl}>Category <span style={{ color: C.accent }}>*</span></label>
                  <div style={g3}>
                    {CATEGORIES.map(c => (
                      <button key={c.value} type="button" onClick={() => {
                        setV("category", c.value)
                        const defaults: Record<string, { seats: number; luggage: number }> = {
                          hatchback:       { seats: 4,  luggage: 1 },
                          sedan:           { seats: 4,  luggage: 2 },
                          suv:             { seats: 6,  luggage: 3 },
                          muv:             { seats: 7,  luggage: 3 },
                          xuv:             { seats: 7,  luggage: 3 },
                          innova:          { seats: 7,  luggage: 3 },
                          ertiga:          { seats: 7,  luggage: 2 },
                          tempo_traveller: { seats: 12, luggage: 6 },
                          mini_bus:        { seats: 20, luggage: 8 },
                          bus:             { seats: 35, luggage: 10 },
                          luxury:          { seats: 4,  luggage: 2 },
                          electric:        { seats: 4,  luggage: 1 },
                        }
                        const d = defaults[c.value]
                        if (d) { setV("seats", d.seats); setV("luggage_capacity", d.luggage) }
                      }}
                        style={{ padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${veh.category === c.value ? C.accent : C.border}`, background: veh.category === c.value ? C.accentBg : C.surface2, color: veh.category === c.value ? C.accentDim : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <span style={{ fontSize: 16 }}>{c.icon}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={g2}>
                  <div>
                    <label style={lbl}>Seating Capacity <span style={{ color: C.accent }}>*</span></label>
                    <input style={inp} type="number" min={1} max={100} value={veh.seats}
                      onChange={e => setV("seats", Number(e.target.value))} onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>Luggage Capacity</label>
                    <input style={inp} type="number" min={0} max={50} value={veh.luggage_capacity}
                      onChange={e => setV("luggage_capacity", Number(e.target.value))} onFocus={onF} onBlur={onB} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Fuel Type</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FUEL_TYPES.map(f => (
                      <button key={f} type="button" onClick={() => setV("fuel_type", f)} style={chip(veh.fuel_type === f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={g2}>
                  <div>
                    <label style={lbl}>AC Available</label>
                    <button type="button" onClick={() => setV("ac", !veh.ac)}
                      style={{ ...chip(veh.ac, C.green), width: "100%", justifyContent: "center" }}>
                      {veh.ac ? "✓ AC" : "Non-AC"}
                    </button>
                  </div>
                  <div>
                    <label style={lbl}>Permit Type</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {PERMIT_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => setV("permit_type", p.value)} style={chip(veh.permit_type === p.value)}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ ...lbl, marginBottom: 8 }}>Features — {veh.features.length} selected</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CAB_FEATURES.map(f => (
                      <button key={f} type="button" onClick={() => toggleFeature(f)} style={chip(veh.features.includes(f))}>
                        {veh.features.includes(f) ? "✓ " : ""}{f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...lbl, marginBottom: 8 }}>Service Types</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SERVICE_TYPES.map(s => (
                      <button key={s.value} type="button" onClick={() => toggleService(s.value)} style={chip(veh.service_types.includes(s.value))}>
                        {veh.service_types.includes(s.value) ? "✓ " : ""}{s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <button type="button" onClick={() => setV("is_featured", !veh.is_featured)}
                    style={{ ...chip(veh.is_featured, C.amber), padding: "8px 16px" }}>
                    {veh.is_featured ? "★ Featured — shows on homepage" : "☆ Not Featured"}
                  </button>
                </div>
              </div>
            </div>

            {/* Physical vehicle info */}
            <div>
              <div style={secTitle}>Vehicle Information</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Registration Number</label>
                    <input style={inp} value={veh.registration_number}
                      onChange={e => setV("registration_number", e.target.value)}
                      placeholder="HR01AB1234" onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>Vehicle Model</label>
                    <input style={inp} value={veh.vehicle_model}
                      onChange={e => setV("vehicle_model", e.target.value)}
                      placeholder="Toyota Innova Crysta 2.4 G" onFocus={onF} onBlur={onB} />
                  </div>
                </div>
                <div style={g4}>
                  <div>
                    <label style={lbl}>Color</label>
                    <input style={inp} value={veh.vehicle_color}
                      onChange={e => setV("vehicle_color", e.target.value)}
                      placeholder="White" onFocus={onF} onBlur={onB} />
                  </div>
                  <div>
                    <label style={lbl}>Year</label>
                    <input style={inp} type="number" min={2000} max={new Date().getFullYear() + 1}
                      value={veh.vehicle_year}
                      onChange={e => setV("vehicle_year", Number(e.target.value))}
                      onFocus={onF} onBlur={onB} />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={lbl}>Base City</label>
                    <input style={inp} value={veh.base_city}
                      onChange={e => setV("base_city", e.target.value)}
                      placeholder="Chandigarh" onFocus={onF} onBlur={onB} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Vehicle Notes</label>
                  <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }}
                    value={veh.vehicle_notes}
                    onChange={e => setV("vehicle_notes", e.target.value)}
                    placeholder="Any special notes about the vehicle…" onFocus={onF} onBlur={onB} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — CITIES & PHOTOS ══ */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={secTitle}>Operating Cities <span style={{ color: C.accent }}>*</span></div>
              <div style={{ padding: "10px 14px", background: C.blueBg, border: `1px solid ${C.blueBd}`, borderRadius: 7, fontSize: 12, color: C.blue, marginBottom: 16 }}>
                🗺️ Cities where this cab is available for pickup. Both city and state required for correct filtering.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cities.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 2 }}>
                      {i === 0 && <label style={{ ...lbl, marginBottom: 5 }}>City</label>}
                      <input style={inp} value={c.city} onChange={e => updateCity(i, "city", e.target.value)}
                        placeholder="e.g. Chandigarh" onFocus={onF} onBlur={onB} />
                    </div>
                    <div style={{ flex: 2 }}>
                      {i === 0 && <label style={{ ...lbl, marginBottom: 5 }}>State</label>}
                      <select style={{ ...inp, cursor: "pointer" }} value={c.state}
                        onChange={e => updateCity(i, "state", e.target.value)} onFocus={onF} onBlur={onB}>
                        <option value="">— Select state —</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {cities.length > 1 && (
                      <button type="button" onClick={() => removeCity(i)}
                        style={{ padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${C.redBd}`, background: C.redBg, color: C.red, cursor: "pointer", fontWeight: 700, flexShrink: 0, marginBottom: 1 }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addCity}
                  style={{ alignSelf: "flex-start", padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface2, color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
                  + Add City
                </button>
              </div>
            </div>

            <div>
              <div style={secTitle}>Photos</div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...lbl, marginBottom: 10 }}>Featured Image (shown in search results)</label>
                {featuredImage ? (
                  <div style={{ position: "relative", width: 160, height: 110, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
                    <img src={featuredImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => setFeaturedImage("")}
                      style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    <span style={{ position: "absolute", top: 4, left: 4, padding: "1px 6px", borderRadius: 4, background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700 }}>Main</span>
                  </div>
                ) : (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, width: 160, height: 110, borderRadius: 8, border: `2px dashed ${C.border}`, background: C.surface2, cursor: "pointer" }}>
                    <span style={{ fontSize: 24 }}>📷</span>
                    <span style={{ fontSize: 11, color: C.muted }}>Upload Featured</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
                        try { const r = await uploadAdminCabPhoto(file, "featured"); setFeaturedImage(r.url); }
                        catch (err) { console.error(err); }
                        e.target.value = "";
                      }} />
                  </label>
                )}
              </div>

              <div>
                <label style={{ ...lbl, marginBottom: 10 }}>Gallery Images — {galleryImages.length} uploaded</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {galleryImages.map((src, idx) => (
                    <div key={idx} style={{ position: "relative", width: 100, height: 74, borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={() => setGalleryImages(g => g.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                  {galleryImages.length < 10 && (
                    <label style={{ width: 100, height: 74, borderRadius: 6, cursor: "pointer", border: `2px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: C.surface2 }}>
                      <span style={{ fontSize: 20 }}>+</span>
                      <span style={{ fontSize: 10, color: C.muted }}>Add Photo</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          for (const file of Array.from(files).slice(0, 10 - galleryImages.length)) {
                            if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) continue;
                            try { const r = await uploadAdminCabPhoto(file, "gallery"); setGalleryImages(g => [...g, r.url]); }
                            catch (err) { console.error(err); }
                          }
                          e.target.value = "";
                        }} />
                    </label>
                  )}
                </div>
                <p style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>JPEG / PNG / WebP · max 10 MB each · up to 10 images</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — WEBSITE PRICING ══ */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={secTitle}>Website Booking Pricing (V2 Rate Card)</div>
            <div style={{ padding: "10px 14px", background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 7, fontSize: 12, color: C.amber }}>
              💡 Enter net rate (what you pay the owner) + margin %. System auto-computes the selling rate shown to guests. All optional — Admin can complete later.
            </div>

            {/* Rate card */}
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", background: C.surface2, borderBottom: `1px solid ${C.border}`, padding: "10px 16px" }}>
                {["Trip Type", "Net Rate", "Margin %", "Selling Rate"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>
              {TRIP_RATE_ROWS.map((row, ri) => {
                const netKey    = `${row.key}_net`    as keyof PricingState;
                const marginKey = `${row.key}_margin` as keyof PricingState;
                const net    = pricing[netKey]    as number;
                const margin = pricing[marginKey] as number;
                const sel    = selling(net, margin);
                return (
                  <div key={row.key} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: ri < TRIP_RATE_ROWS.length - 1 ? `1px solid ${C.border}` : "none", background: ri % 2 === 0 ? C.surface : C.surface2 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.label}</div>
                      {row.note && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{row.note}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, color: C.muted }}>₹</span>
                      <input style={{ ...inp, padding: "6px 8px", fontSize: 13 }} type="number" min={0} step={0.5}
                        value={net || ""} placeholder="0"
                        onChange={e => setPricing(f => ({ ...f, [netKey]: parseFloat(e.target.value) || 0 }))}
                        onFocus={onF} onBlur={onB} />
                      <span style={{ fontSize: 11, color: C.dim }}>{row.unit}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input style={{ ...inp, padding: "6px 8px", fontSize: 13, width: 64 }} type="number" min={0} max={100} step={0.5}
                        value={margin || ""} placeholder="25"
                        onChange={e => setPricing(f => ({ ...f, [marginKey]: parseFloat(e.target.value) || 0 }))}
                        onFocus={onF} onBlur={onB} />
                      <span style={{ fontSize: 12, color: C.muted }}>%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: net > 0 ? C.green : C.dim }}>
                        {net > 0 ? `₹${sel.toLocaleString("en-IN")}` : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full day config */}
            <div>
              <label style={{ ...lbl, marginBottom: 12 }}>Full Day Configuration</label>
              <div style={g2}>
                {([
                  { label: "Included KM", key: "fullday_included_km" as const, placeholder: "80" },
                  { label: "Included Hours", key: "fullday_included_hrs" as const, placeholder: "8" },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input style={inp} type="number" min={0} value={pricing[f.key] || ""}
                      placeholder={f.placeholder}
                      onChange={e => setPricing(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                      onFocus={onF} onBlur={onB} />
                  </div>
                ))}
              </div>
            </div>

            {/* Extra charges */}
            <div>
              <label style={{ ...lbl, marginBottom: 12 }}>Extra Charges</label>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", background: C.surface2, borderBottom: `1px solid ${C.border}`, padding: "10px 16px" }}>
                  {["Type", "Net Rate", "Margin %", "Selling Rate"].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</span>
                  ))}
                </div>
                {([
                  { label: "Extra KM", net: "extra_km_net" as const, margin: "extra_km_margin" as const, unit: "₹/km" },
                  { label: "Extra Hour", net: "extra_hr_net" as const, margin: "extra_hr_margin" as const, unit: "₹/hr" },
                ] as const).map((row, ri) => {
                  const net = pricing[row.net]; const margin = pricing[row.margin]; const sel = selling(net, margin);
                  return (
                    <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: ri === 0 ? `1px solid ${C.border}` : "none", background: ri % 2 === 0 ? C.surface : C.surface2 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>₹</span>
                        <input style={{ ...inp, padding: "6px 8px", fontSize: 13 }} type="number" min={0} step={0.5}
                          value={net || ""} placeholder="0"
                          onChange={e => setPricing(p => ({ ...p, [row.net]: parseFloat(e.target.value) || 0 }))}
                          onFocus={onF} onBlur={onB} />
                        <span style={{ fontSize: 11, color: C.dim }}>{row.unit}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input style={{ ...inp, padding: "6px 8px", fontSize: 13, width: 64 }} type="number" min={0} max={100} step={0.5}
                          value={margin || ""} placeholder="25"
                          onChange={e => setPricing(p => ({ ...p, [row.margin]: parseFloat(e.target.value) || 0 }))}
                          onFocus={onF} onBlur={onB} />
                        <span style={{ fontSize: 12, color: C.muted }}>%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: net > 0 ? C.green : C.dim }}>{net > 0 ? `₹${sel.toLocaleString("en-IN")}` : "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global settings */}
            <div>
              <label style={{ ...lbl, marginBottom: 12 }}>Global Settings</label>
              <div style={g3}>
                <div>
                  <label style={lbl}>Off-season Multiplier</label>
                  <input style={inp} type="number" min={0.1} max={1.0} step={0.05}
                    value={pricing.offseason_multiplier}
                    onChange={e => setPricing(p => ({ ...p, offseason_multiplier: parseFloat(e.target.value) || 0.85 }))}
                    onFocus={onF} onBlur={onB} />
                  <p style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>0.85 = 15% off in off-season</p>
                </div>
                <div>
                  <label style={lbl}>Driver Allowance/Night ₹</label>
                  <input style={inp} type="number" min={0} value={pricing.driver_allowance_per_night || ""}
                    placeholder="300"
                    onChange={e => setPricing(p => ({ ...p, driver_allowance_per_night: parseFloat(e.target.value) || 0 }))}
                    onFocus={onF} onBlur={onB} />
                </div>
                <div>
                  <label style={lbl}>Night Charge ₹</label>
                  <input style={inp} type="number" min={0} value={pricing.night_charge || ""}
                    placeholder="0 (10 PM – 6 AM)"
                    onChange={e => setPricing(p => ({ ...p, night_charge: parseFloat(e.target.value) || 0 }))}
                    onFocus={onF} onBlur={onB} />
                </div>
              </div>
            </div>
            {/* Category rates info */}
            <div style={{ padding: "12px 14px", background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 7, fontSize: 13, color: C.green }}>
              📦 <strong>Package day rates</strong> are set per category (Sedan, SUV, etc.) in <strong>Cabs → Category Rates</strong>. All cabs in a category auto-inherit those rates.
            </div>

            <div style={{ padding: "12px 14px", background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 7, fontSize: 13, color: C.green }}>
              ✅ After submission, this cab goes to <strong>Admin</strong> for review and activation.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 28px", background: C.surface2, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: C.dim }}>Step {step + 1} of {STEPS.length} — {STEPS[step].label}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button type="button" onClick={back}
              style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ← Back
            </button>
          )}
          {!isLast ? (
            <button type="button" onClick={next}
              style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Next →
            </button>
          ) : (
            <button type="submit" disabled={loading}
              style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: loading ? C.border2 : C.green, color: loading ? C.muted : "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading && <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "acfspinX 0.6s linear infinite" }} />}
              {isEdit ? "💾 Save Changes" : "✓ Save Cab"}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes acfspinX { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}