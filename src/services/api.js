const BASE_URL = 'http://127.0.0.1:8000/api/v1'

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`).then(r => r.json()),

  post: (path, data) => fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  put: (path, data) => fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  delete: (path) => fetch(`${BASE_URL}${path}`, {
    method: 'DELETE'
  }).then(r => r.json()),
}
