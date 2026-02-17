import http from 'k6/http';
import { check, sleep } from 'k6';
import { defaultOptions, BASE_URL } from './k6-config.js';

export const options = { ...defaultOptions };

const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'loadtest@example.com',
  password: __ENV.TEST_PASSWORD || 'LoadTest123!',
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(TEST_USER), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const cookies = loginRes.cookies;
  return { cookies };
}

export default function (data) {
  const jar = http.cookieJar();
  if (data.cookies) {
    for (const [name, values] of Object.entries(data.cookies)) {
      for (const cookie of values) {
        jar.set(BASE_URL, name, cookie.value);
      }
    }
  }

  const res = http.get(`${BASE_URL}/api/downloads?status=COMPLETED&page=1&limit=20`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => {
      const body = r.json();
      return body && body.data !== undefined;
    },
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
