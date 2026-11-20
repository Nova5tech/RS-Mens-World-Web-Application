/**
 * Generic mock storage and adapter utility
 * Simulates network latency (default 300ms) and provides persistent localStorage operations.
 */
export async function mockDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockStorage<T extends { id: string }> {
  private key: string;
  private defaultData: T[];

  constructor(key: string, defaultData: T[]) {
    this.key = `rs_mock_${key}`;
    this.defaultData = defaultData;
  }

  private getAllInternal(): T[] {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      localStorage.setItem(this.key, JSON.stringify(this.defaultData));
      return [...this.defaultData];
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      localStorage.setItem(this.key, JSON.stringify(this.defaultData));
      return [...this.defaultData];
    }
  }

  private saveInternal(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  async getAll(): Promise<T[]> {
    await mockDelay(300);
    return this.getAllInternal();
  }

  async getById(id: string): Promise<T | null> {
    await mockDelay(300);
    const items = this.getAllInternal();
    return items.find((item) => item.id === id) || null;
  }

  async insert(item: T): Promise<T> {
    await mockDelay(300);
    const items = this.getAllInternal();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    this.saveInternal(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    await mockDelay(300);
    const items = this.getAllInternal();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.saveInternal(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    await mockDelay(300);
    const items = this.getAllInternal();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.saveInternal(filtered);
    return true;
  }

  async reset(): Promise<void> {
    await mockDelay(100);
    this.saveInternal(this.defaultData);
  }
}
