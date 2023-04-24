import { AxiosError } from 'axios';

export interface Pagination {
  totalPages: number;
  totalResults: number;
  currentPage: number;
  results: number;
  itemsPerPage: number;
}

interface HttpResponse<T = any> {
  status: 'success';
  data?: T;
  pagination?: Pagination;
  message?: string;
}

type HttpError = {
  status: 'fail';
  message: string;
  errors?: string[];
};

export type { HttpError, HttpResponse };
