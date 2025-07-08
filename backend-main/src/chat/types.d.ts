declare namespace Express {
  export interface Request {
    user?: {
      phone_number: string;
      id: number;
    };
  }
}
