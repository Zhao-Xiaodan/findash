import { buildFredUrl, parseObservations } from './fred'

describe('buildFredUrl', () => {
  it('includes series_id and api_key', () => {
    const url = buildFredUrl('BAMLH0A0HYM2', 'testkey')
    expect(url).toContain('series_id=BAMLH0A0HYM2')
    expect(url).toContain('api_key=testkey')
  })
  it('includes file_type json', () => {
    const url = buildFredUrl('PERMIT', 'key')
    expect(url).toContain('file_type=json')
  })
})

describe('parseObservations', () => {
  it('returns date/value pairs', () => {
    const raw = {
      observations: [
        { date: '2024-01-01', value: '4.2' },
        { date: '2024-02-01', value: '3.9' },
      ]
    }
    const result = parseObservations(raw)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2024-01-01', value: 4.2 })
  })
  it('filters out missing values (dot)', () => {
    const raw = {
      observations: [
        { date: '2024-01-01', value: '.' },
        { date: '2024-02-01', value: '3.9' },
      ]
    }
    const result = parseObservations(raw)
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe(3.9)
  })
  it('returns results in ascending date order', () => {
    const raw = {
      observations: [
        { date: '2024-03-01', value: '5.0' },
        { date: '2024-01-01', value: '4.0' },
      ]
    }
    const result = parseObservations(raw)
    expect(result[0].date).toBe('2024-01-01')
  })
})
