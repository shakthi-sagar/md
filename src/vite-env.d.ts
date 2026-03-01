/// <reference types="vite/client" />

declare module 'storehouse-js' {
  const Storehouse: {
    getItem(namespace: string, key: string): string | null;
    setItem(namespace: string, key: string, value: string | boolean, expiredAt: Date): void;
  };
  export default Storehouse;
}
