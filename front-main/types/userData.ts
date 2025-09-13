export interface AddressData {
  user_id: number;
  name: string;
  lat?: string | null;
  long?: string | null;
  address: string;
  region_id?: number | null;
  district_id?: number | null;
}
