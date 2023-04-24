import { AxiosError } from 'axios';

export interface Pagination {
  totalPages: number;
  totalResults: number;
  currentPage: number;
  results: number;
  itemsPerPage: number;
}

interface HttpResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  pagination?: Pagination;
  errors?: string[];
}

type HttpError = AxiosError<{
  status: string;
  message: string;
  errors?: string[];
}>;

export type { HttpError, HttpResponse };
