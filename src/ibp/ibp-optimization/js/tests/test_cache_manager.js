// In browser console:
const cache = new CacheManager();
cache.set('test', { data: 'test' });
console.log('Cached:', cache.get('test'));
console.log('Stats:', cache.getStats());