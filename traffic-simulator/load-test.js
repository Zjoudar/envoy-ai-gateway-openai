const { loadTest } = require('k6/x/openai');
const { check } = require('k6');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = loadTest({
    endpoint: 'http://localhost/openai/chat/completions',
    apiKey: __ENV.OPENAI_API_KEY,
    payload: {
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: "Hello"}]
    }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}