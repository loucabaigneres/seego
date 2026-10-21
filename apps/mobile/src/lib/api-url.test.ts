import { resolveApiUrl } from './api-url';

describe('resolveApiUrl', () => {
  it('points localhost to the IP of the dev machine, keeping port and path', () => {
    expect(resolveApiUrl('http://localhost:3000', '192.168.1.29:8081')).toBe(
      'http://192.168.1.29:3000',
    );
    expect(resolveApiUrl('http://127.0.0.1:3000/api', '10.0.0.4:8081')).toBe(
      'http://10.0.0.4:3000/api',
    );
  });

  it('keeps localhost when there is no dev server host (web) or when it is local too', () => {
    expect(resolveApiUrl('http://localhost:3000', undefined)).toBe('http://localhost:3000');
    expect(resolveApiUrl('http://localhost:3000', '127.0.0.1:8081')).toBe('http://localhost:3000');
  });

  it('keeps localhost behind an Expo tunnel, which does not expose the API', () => {
    expect(resolveApiUrl('http://localhost:3000', 'abc-anonymous-8081.exp.direct')).toBe(
      'http://localhost:3000',
    );
  });

  it('never changes a remote API URL', () => {
    expect(resolveApiUrl('https://api.seego.app', '192.168.1.29:8081')).toBe(
      'https://api.seego.app',
    );
    expect(resolveApiUrl('http://localhost.example.com', '192.168.1.29:8081')).toBe(
      'http://localhost.example.com',
    );
  });
});
