export interface Address {
  id: number;
  user_id: number;
  name: string;
  lat?: string;
  long?: string;
  is_main: boolean;
  region_id?: number;
  district_id?: number;
  address: string;
}

export interface AddressRes {
  data: Address;
  message: string;
  status_code: number;
}
