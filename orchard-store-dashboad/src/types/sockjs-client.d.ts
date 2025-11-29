declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, protocols?: string | string[], options?: Record<string, unknown>);
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    readyState: number;
    protocol: string;
    url: string;
  }
}

