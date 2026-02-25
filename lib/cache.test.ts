import { createCache } from './cache'

describe('createCache', () => {
  it('returns null for missing key', () => {
    const cache = createCache(1000)
    expect(cache.get('x')).toBeNull()
  })
  it('returns cached value within TTL', () => {
    const cache = createCache(1000 * 60)
    cache.set('k', { v: 1 })
    expect(cache.get('k')).toEqual({ v: 1 })
  })
  it('returns null after TTL expires', () => {
    vi.useFakeTimers()
    const cache = createCache(1000)
    cache.set('k', { v: 1 })
    vi.advanceTimersByTime(2000)
    expect(cache.get('k')).toBeNull()
    vi.useRealTimers()
  })
})
