import http from 'k6/http';
import { check, sleep } from 'k6';
import { defaultOptions, BASE_URL } from './k6-config.js';

export const options = { ...defaultOptions };

const PLATFORMS = ['youtube', 'tiktok'];
const REGIONS = ['US', 'GB', 'VN'];

export default function () {
  const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

  const res = http.get(
    `${BASE_URL}/api/trending?platform=${platform}&region=${region}&page=1&limit=20`,
  );

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
