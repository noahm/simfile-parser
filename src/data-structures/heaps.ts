/**
 * Data structure to track multiple piles of V under a shared K
 */
export class Heaps<K, V> {
  private items = new Map<K, V[]>();

  public get size() {
    return this.items.size;
  }

  public add(key: K, item: V) {
    const next = this.get(key);
    next.push(item);
    this.items.set(key, next);
    return next;
  }

  public get(key: K) {
    return this.items.get(key) || [];
  }

  public has(key: K) {
    return this.items.has(key);
  }

  public entries() {
    return this.items.entries();
  }
}
