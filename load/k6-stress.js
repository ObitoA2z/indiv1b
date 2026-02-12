import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "2m", target: 120 },
    { duration: "2m", target: 180 },
    { duration: "1m", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<1500"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:4004";

export default function () {
  const h = http.get(`${BASE_URL}/api/health`);
  check(h, { "health 200": (r) => r.status === 200 });

  const p = http.get(`${BASE_URL}/api/products`);
  check(p, { "products 200": (r) => r.status === 200 });

  sleep(0.2);
}
