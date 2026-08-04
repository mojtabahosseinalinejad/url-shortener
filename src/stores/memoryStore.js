export function createMemoryStore() {
  const store = new Map();

  return {
    set(key, value) {
      store.set(key, value);
    },
    get(key) {
      return store.get(key);
    },
    has(key) {
      return store.has(key);
    },
    delete(key) {
      store.delete(key);
    }
  };
}
