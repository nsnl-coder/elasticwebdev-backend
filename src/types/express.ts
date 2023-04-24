interface ReqQuery {
  fields: string;
  sort: string;
  page: number;
  itemsPerPage: number;
  skip: number;
  // file query
  limit: number;
  startAfter: string;
  prefix: string;
  key: string;
  filter: {
    [key: string]: any;
  };
}

declare module 'express' {
  interface Request {
    rawBody?: any;
    query: ReqQuery;
  }
}

export type { ReqQuery };
