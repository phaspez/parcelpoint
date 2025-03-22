export interface Pagination<T> {
  current_page: number;
  items: number;
  next?: number;
  previous?: number;
  page_count: number;
  data: T[];
}
