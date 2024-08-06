class Cache {
  constructor() {
    this.cache = {};
  }

  set(key, value) {
    this.cache[key] = value;
  }

  get(key) {
    return this.cache[key];
  }

  has(key) {
    return this.cache.hasOwnProperty(key);
  }
}

export default new Cache();