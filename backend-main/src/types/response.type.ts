export type ResponseFields = {
  id: number;
  access_token: string;
};

export interface IResponse {
  data: any;
  status_code: number;
  message: string | string[];
}
