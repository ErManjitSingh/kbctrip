export type TrainStation = {
  code: string;
  name: string;
  city: string;
};

export const TRAIN_STATIONS: TrainStation[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj T', city: 'Mumbai' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru' },
  { code: 'YPR', name: 'Yesvantpur Jn', city: 'Bengaluru' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
  { code: 'ADI', name: 'Ahmedabad Jn', city: 'Ahmedabad' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad' },
  { code: 'SC', name: 'Secunderabad Jn', city: 'Hyderabad' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal' },
  { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu' },
  { code: 'BSB', name: 'Varanasi Jn', city: 'Varanasi' },
  { code: 'GKP', name: 'Gorakhpur Jn', city: 'Gorakhpur' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur' },
];

export function filterTrainStations(query: string, exclude?: string) {
  const q = query.trim().toLowerCase();
  return TRAIN_STATIONS.filter((station) => {
    if (exclude && station.code === exclude) return false;
    if (!q) return true;
    return (
      station.code.toLowerCase().includes(q) ||
      station.name.toLowerCase().includes(q) ||
      station.city.toLowerCase().includes(q)
    );
  }).slice(0, 10);
}
