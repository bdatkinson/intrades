export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}
