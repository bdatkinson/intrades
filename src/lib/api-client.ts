type ApiClientOptions = {
  timeout?: number;
};

export class ApiClient {
  baseUrl: string;
  authToken: string | null = null;
  timeout: number;

  constructor(baseUrl: string, options: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.timeout = options.timeout || 5000;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async get(path: string) {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return await this.handleResponse(response);
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private async fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      });
      clearTimeout(timeout);
      return response;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error && (error.name === 'AbortError' || error.name === 'DOMException' && error.message.includes('abort'))) {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}