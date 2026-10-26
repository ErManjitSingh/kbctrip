'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BedDouble,
  CalendarDays,
  Car,
  Compass,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  MapPin,
  Minus,
  Plane,
  Plus,
  Search,
  TrainFront,
  Users,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  findHotelLocality,
  hotelResultsHref,
  HOTEL_MAJOR_CITY_OPTIONS,
  matchHotelDestinationFromList,
  slugifyCityName,
} from '@/lib/hotels-catalog';

const coreServices = [
  { label: 'Packages', icon: Gift },
  { label: 'Hotels', icon: BedDouble },
  { label: 'Cabs', icon: Car },
] as const;

const bannerServices = [
  { label: 'Packages', icon: Gift },
  { label: 'Hotels', icon: BedDouble },
  { label: 'Cabs', icon: Car },
  { label: 'Activity', icon: Compass },
  { label: 'Trains', icon: TrainFront },
  { label: 'Flights', icon: Plane },
] as const;

type Service = (typeof bannerServices)[number]['label'];
type PopoverName = 'location' | 'start' | 'end' | 'travellers' | null;

type Destination = {
  name: string;
  detail: string;
  search: string;
};

const destinationSets: Record<Service, Destination[]> = {
  Hotels: HOTEL_MAJOR_CITY_OPTIONS.map((city) => ({
    name: city.city,
    detail: city.state ? `${city.state}, ${city.country}` : city.country,
    search: city.city,
  })),
  Cabs: [
    { name: 'Bengaluru Airport → City Centre', detail: 'Airport transfer · 38 km', search: 'Bengaluru Airport' },
    { name: 'Delhi Airport → Gurugram', detail: 'Airport transfer · 18 km', search: 'Delhi Airport' },
    { name: 'Chandigarh → Shimla', detail: 'Outstation · 113 km', search: 'Chandigarh to Shimla' },
    { name: 'Jaipur → Udaipur', detail: 'Outstation · 395 km', search: 'Jaipur to Udaipur' },
  ],
  Packages: [
    { name: 'Goa', detail: 'Beach packages', search: 'Goa' },
    { name: 'Manali', detail: 'Hill packages', search: 'Manali' },
    { name: 'Kashmir', detail: 'Valley packages', search: 'Kashmir' },
    { name: 'Jaipur', detail: 'Rajasthan packages', search: 'Jaipur' },
    { name: 'Shimla', detail: 'Himachal packages', search: 'Shimla' },
    { name: 'Dubai', detail: 'International packages', search: 'Dubai' },
    { name: 'Kerala', detail: 'South India packages', search: 'Kerala' },
  ],
  Flights: [
    { name: 'Delhi', detail: 'DEL · Indira Gandhi', search: 'Delhi' },
    { name: 'Mumbai', detail: 'BOM · Chhatrapati Shivaji', search: 'Mumbai' },
    { name: 'Goa', detail: 'GOI · Dabolim', search: 'Goa' },
    { name: 'Bengaluru', detail: 'BLR · Kempegowda', search: 'Bengaluru' },
    { name: 'Dubai', detail: 'DXB · International', search: 'Dubai' },
  ],
  Trains: [
    { name: 'Delhi → Jaipur', detail: 'Rail · about 5 hours', search: 'Delhi to Jaipur' },
    { name: 'Chandigarh → Shimla', detail: 'Rail · toy train', search: 'Chandigarh to Shimla' },
    { name: 'Mumbai → Goa', detail: 'Rail · Konkan', search: 'Mumbai to Goa' },
    { name: 'Delhi → Manali route', detail: 'Rail to Chandigarh, then hill', search: 'Delhi to Manali' },
  ],
  Activity: [
    { name: 'Goa', detail: 'Beaches, cruises, water sports', search: 'Goa' },
    { name: 'Manali', detail: 'Solang, rafting, snow', search: 'Manali' },
    { name: 'Jaipur', detail: 'Forts, markets, old city', search: 'Jaipur' },
    { name: 'Shimla', detail: 'Ridge, mall road, walks', search: 'Shimla' },
  ],
};

const serviceCopy: Record<Service, { location: string; start: string; end: string; travellers: string }> = {
  Hotels: { location: 'Where are you going?', start: 'Check-in', end: 'Check-out', travellers: 'Guests & Rooms' },
  Cabs: { location: 'Pickup & drop', start: 'Pickup date', end: 'Pickup time', travellers: 'Passengers & Cars' },
  Packages: { location: 'Where do you want to go?', start: 'Start date', end: 'Duration', travellers: 'Travellers & Rooms' },
  Flights: { location: 'Where are you flying?', start: 'Depart', end: 'Return', travellers: 'Passengers' },
  Trains: { location: 'Where are you going?', start: 'Depart', end: 'Return', travellers: 'Passengers' },
  Activity: { location: 'Where is the activity?', start: 'Start date', end: 'End date', travellers: 'Guests' },
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = monthNames[date.getMonth()].slice(0, 3);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  return `${day} ${month}, ${weekday}`;
}

function formatTripDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function formatQueryDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getCalendarCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: mondayOffset }, () => null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, monthIndex, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function TravelSearch({ variant = 'default', scope = 'core' }: { variant?: 'default' | 'hero'; scope?: 'core' | 'banner' }) {
  const services = scope === 'banner' ? bannerServices : coreServices;
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const [activeService, setActiveService] = useState<Service>('Packages');
  const [openPopover, setOpenPopover] = useState<PopoverName>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return startOfDay(date);
  });
  const [checkOut, setCheckOut] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 9);
    return startOfDay(date);
  });
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [searchMessage, setSearchMessage] = useState('');

  const copy = serviceCopy[activeService];
  const destinationOptions = useMemo(() => {
    const typed = query.trim();
    const normalized = typed.toLowerCase();
    const base = destinationSets[activeService];
    const filtered = !normalized
      ? base
      : base.filter((item) => `${item.name} ${item.detail} ${item.search}`.toLowerCase().includes(normalized));
    if (!typed) return filtered;
    const exact = filtered.some(
      (item) => item.name.toLowerCase() === normalized || item.search.toLowerCase() === normalized,
    );
    if (exact) return filtered;
    return [{ name: typed, detail: 'Search for this place', search: typed }, ...filtered];
  }, [activeService, query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpenPopover(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPopover(null);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function switchService(service: Service) {
    setActiveService(service);
    setDestination(null);
    setQuery('');
    setOpenPopover(null);
    setSearchMessage('');
  }

  function togglePopover(name: Exclude<PopoverName, null>) {
    setOpenPopover((current) => current === name ? null : name);
    setSearchMessage('');
  }

  function selectDate(date: Date) {
    if (openPopover === 'start') {
      setCheckIn(date);
      if (date >= checkOut) setCheckOut(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
      setOpenPopover('end');
      return;
    }
    setCheckOut(date <= checkIn ? new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1) : date);
    setOpenPopover(null);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = destination?.search ?? query.trim();
    if (!city) {
      setOpenPopover('location');
      setSearchMessage('Choose a destination or route to continue.');
      return;
    }

    if (activeService === 'Hotels') {
      const checkInIso = formatQueryDate(checkIn);
      const checkOutIso = formatQueryDate(checkOut);
      if (checkOutIso <= checkInIso) {
        setOpenPopover('end');
        setSearchMessage('Check-out must be after check-in.');
        return;
      }

      const matched = matchHotelDestinationFromList(city, HOTEL_MAJOR_CITY_OPTIONS);
      const isCityHit =
        !!matched &&
        (matched.city.toLowerCase() === city.trim().toLowerCase() ||
          matched.slug === slugifyCityName(city));
      // Only treat as a locality filter when the user did not pick a city.
      const locality = isCityHit ? null : findHotelLocality(city);
      const slug =
        locality?.citySlug || matched?.slug || slugifyCityName(city);

      router.push(
        hotelResultsHref(slug, {
          check_in: checkInIso,
          check_out: checkOutIso,
          rooms,
          guests: adults,
          // Leave `q` empty for city-wide searches so the results strip
          // does not pre-fill a locality like "New Shimla".
          q: locality?.name,
        }),
      );
      return;
    }

    if (activeService === 'Packages') {
      const params = new URLSearchParams({ q: city });
      router.push(`/packages?${params.toString()}`);
      return;
    }

    if (activeService === 'Cabs') {
      const route = destination?.name ?? city;
      const [from, to] = route.split('→').map((part) => part.trim());
      const params = new URLSearchParams({
        pickup: from || city,
        date: formatQueryDate(checkIn),
      });
      if (to) params.set('drop', to);
      router.push(`/cabs?${params.toString()}`);
      return;
    }

    const discoveryPath = activeService === 'Flights' ? '/flights' : activeService === 'Trains' ? '/trains' : '/activities';
    const params = new URLSearchParams({
      q: city,
      date: formatQueryDate(checkIn),
      guests: String(adults + children),
    });
    router.push(`${discoveryPath}?${params.toString()}`);
  }

  const partyCount = adults + children;
  const travellerSummary = activeService === 'Flights' || activeService === 'Trains'
    ? `${partyCount} Passenger${partyCount === 1 ? '' : 's'}`
    : activeService === 'Cabs'
      ? `${partyCount} Passenger${partyCount === 1 ? '' : 's'}, ${rooms} Car${rooms === 1 ? '' : 's'}`
      : activeService === 'Activity'
        ? `${partyCount} Guest${partyCount === 1 ? '' : 's'}`
        : `${partyCount} Guest${partyCount === 1 ? '' : 's'}, ${rooms} Room${rooms === 1 ? '' : 's'}`;
  const guestTrip = activeService === 'Hotels' || activeService === 'Packages'
    ? `${rooms} room${rooms === 1 ? '' : 's'}, ${adults} adult${adults === 1 ? '' : 's'}, ${children} ${children === 1 ? 'child' : 'children'}`
    : travellerSummary;
  const locationEmpty = scope === 'banner' && (activeService === 'Hotels' || activeService === 'Packages')
    ? 'Where to?'
    : copy.location;
  const nightCount = Math.max(1, Math.round((startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime()) / 86400000));

  return (
    <section
      ref={panelRef}
      data-service={activeService}
      className={`search-panel${variant === 'hero' ? ' search-panel-hero' : ' page-width'}`}
      aria-label="Search travel"
    >      <div className="search-tabs" role="tablist" aria-label="Travel category">
        {services.map(({ label, icon: Icon }) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeService === label}
            className={activeService === label ? 'active' : ''}
            key={label}
            onClick={() => switchService(label)}
          >
            <Icon size={18} />
            {label === 'Activity' ? (
              <>
                <span className="search-tab-desk">Activity</span>
                <span className="search-tab-phone">Activities</span>
              </>
            ) : label}
          </button>
        ))}
      </div>

      <form className="search-fields" onSubmit={submitSearch}>
        <div className="search-control search-control-location">
          <button type="button" className="search-control-trigger" aria-expanded={openPopover === 'location'} aria-haspopup="listbox" onClick={() => togglePopover('location')}>
            <span>
              <MapPin className="loc-pin" size={13} aria-hidden />
              <Search className="loc-glass" size={16} aria-hidden />
              {copy.location}
            </span>
            <strong className={destination ? undefined : 'is-placeholder'}>
              {destination ? destination.name : (
                <>
                  <span className="search-loc-desk">{locationEmpty}</span>
                  <span className="search-loc-phone">Where do you want to go?</span>
                </>
              )}
              <ChevronDown size={14} />
            </strong>
          </button>
          {openPopover === 'location' && (
            <div className="search-popover location-popover">
              <div className="popover-title"><div><b>{copy.location}</b><small>Type or choose a popular option</small></div><button type="button" aria-label="Close destination menu" onClick={() => setOpenPopover(null)}><X size={16} /></button></div>
              <label className="destination-search"><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations or routes" /></label>
              <div className="destination-list" role="listbox" aria-label="Destination suggestions">
                {destinationOptions.map((item) => (
                  <button type="button" role="option" aria-selected={destination?.name === item.name} key={item.name} onClick={() => { setDestination(item); setQuery(''); setOpenPopover(null); }}>
                    <span className="option-icon"><MapPin size={16} /></span>
                    <span><b>{item.name}</b><small>{item.detail}</small></span>
                    {destination?.name === item.name && <Check size={17} />}
                  </button>
                ))}
                {destinationOptions.length === 0 && <p className="empty-options">No matching destination found.</p>}
              </div>
            </div>
          )}
        </div>

        <DateControl label={copy.start} value={checkIn} open={openPopover === 'start'} name="start" onToggle={togglePopover}>
          <CalendarPopover month={visibleMonth} selected={checkIn} rangeStart={checkIn} rangeEnd={checkOut} onMonthChange={setVisibleMonth} onSelect={selectDate} title={copy.start} />
        </DateControl>

        <DateControl label={copy.end} value={checkOut} open={openPopover === 'end'} name="end" badge={`${nightCount} night${nightCount === 1 ? '' : 's'}`} onToggle={togglePopover}>
          <CalendarPopover month={visibleMonth} selected={checkOut} rangeStart={checkIn} rangeEnd={checkOut} onMonthChange={setVisibleMonth} onSelect={selectDate} title={copy.end} />
        </DateControl>

        <div className="search-control search-control-travellers">
          <button type="button" className="search-control-trigger" aria-expanded={openPopover === 'travellers'} aria-haspopup="dialog" onClick={() => togglePopover('travellers')}>
            <span><Users size={13} aria-hidden />{copy.travellers}</span>
            <strong>
              <span className="search-guest-home">{travellerSummary}</span>
              <span className="search-guest-trip">{guestTrip}</span>
              <ChevronDown size={14} />
            </strong>
          </button>
          {openPopover === 'travellers' && (
            <div className="search-popover traveller-popover" role="dialog" aria-label="Choose travellers and rooms">
              <div className="popover-title"><div><b>Travellers & rooms</b><small>Set who is travelling</small></div><button type="button" aria-label="Close traveller menu" onClick={() => setOpenPopover(null)}><X size={16} /></button></div>
              <Stepper label="Adults" detail="Ages 12+" value={adults} minimum={1} maximum={10} onChange={setAdults} />
              <Stepper label="Children" detail="Ages 0–11" value={children} minimum={0} maximum={8} onChange={setChildren} />
              <Stepper label="Rooms" detail="Number of rooms" value={rooms} minimum={1} maximum={8} onChange={setRooms} />
              <button type="button" className="popover-done" onClick={() => setOpenPopover(null)}>Done</button>
            </div>
          )}
        </div>

        <button className="search-submit" type="submit">
          <Search className="search-submit-icon" size={16} aria-hidden />
          <ArrowRight className="search-submit-arrow" size={16} aria-hidden />
          <span>Search</span>
        </button>
      </form>
      {searchMessage && <p className="search-notice" role="status">{searchMessage}</p>}
    </section>
  );
}

function DateControl({ label, value, open, name, badge, onToggle, children }: { label: string; value: Date; open: boolean; name: 'start' | 'end'; badge?: string; onToggle: (name: 'start' | 'end') => void; children: React.ReactNode }) {
  return (
    <div className={`search-control search-control-date search-control-${name}`}>
      <button type="button" className="search-control-trigger" aria-expanded={open} aria-haspopup="dialog" onClick={() => onToggle(name)}>
        <span><CalendarDays size={13} aria-hidden />{label}</span>
        <strong>
          <span className="search-date-kind">{label}</span>
          <span className="search-date-home">{formatDate(value)}</span>
          <span className="search-date-trip">{formatTripDate(value)}</span>
          {badge ? <em className="search-nights">{badge}</em> : null}
          <ChevronDown size={14} />
        </strong>
      </button>
      {open && children}
    </div>
  );
}

function CalendarPopover({ month, selected, rangeStart, rangeEnd, onMonthChange, onSelect, title }: { month: Date; selected: Date; rangeStart: Date; rangeEnd: Date; onMonthChange: (date: Date) => void; onSelect: (date: Date) => void; title: string }) {
  const cells = getCalendarCells(month);
  return (
    <div className="search-popover calendar-popover" role="dialog" aria-label={`Choose ${title.toLowerCase()}`}>
      <div className="calendar-header">
        <button type="button" aria-label="Previous month" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
        <b>{monthNames[month.getMonth()]} {month.getFullYear()}</b>
        <button type="button" aria-label="Next month" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
      </div>
      <div className="calendar-weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {cells.map((date, index) => date ? (
          <button
            type="button"
            aria-label={new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(date)}
            className={`${sameDate(date, selected) ? 'selected' : ''} ${date > startOfDay(rangeStart) && date < startOfDay(rangeEnd) ? 'in-range' : ''}`}
            key={date.toISOString()}
            onClick={() => onSelect(date)}
          >{date.getDate()}</button>
        ) : <span key={`empty-${index}`} />)}
      </div>
      <div className="calendar-footer"><span>Selected</span><b>{formatDate(selected)}</b></div>
    </div>
  );
}

function Stepper({ label, detail, value, minimum, maximum, onChange }: { label: string; detail: string; value: number; minimum: number; maximum: number; onChange: (value: number) => void }) {
  return (
    <div className="traveller-row">
      <div><b>{label}</b><small>{detail}</small></div>
      <div className="stepper">
        <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= minimum} onClick={() => onChange(Math.max(minimum, value - 1))}><Minus size={15} /></button>
        <strong>{value}</strong>
        <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= maximum} onClick={() => onChange(Math.min(maximum, value + 1))}><Plus size={15} /></button>
      </div>
    </div>
  );
}
