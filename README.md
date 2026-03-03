```markdown
# Careaxiom Assessment — Website Titles API

A small Node.js service that exposes **one endpoint**:

`GET /I/want/title?address=<site>&address=<site2>...`

It fetches each website, extracts the HTML `<title>`, and returns a simple HTML page listing the results in the **same order** as the input. If a website is invalid/unreachable/blocked/non-200/timeout/etc, it prints **`NO RESPONSE`**.

Includes **three implementations** (per assessment):
1. **Plain Node.js callbacks** (no control-flow abstraction)
2. **Flow library** (`async.js`)
3. **Promises**

Also includes a **native request logger**: time, method, path, status, duration.

---

## Setup

### 1) Install dependencies
```bash
npm install
````

### 2) Start the server

Default runs Promises strategy on port `3000`:

```bash
npm start
```

---

## Run Each Assessment Task (Strategies)

### Task #1 — Callbacks Only (strict)

> Plain Node.js callbacks, no promises, no async.js, no flow abstractions.

```bash
npm run start:callbacks
```

### Task #2 — Flow Library (`async.js`)

```bash
npm run start:async
```

### Task #3 — Promises

```bash
npm run start:promises
```

---

## Configuration (Overrides)

All values can be overridden via environment variables:

| Variable        | Description                        | Default           |
| --------------- | ---------------------------------- | ----------------- |
| `PORT`          | Server port                        | `3000`            |
| `STRATEGY`      | `callbacks` | `async` | `promises` | `promises`        |
| `TIMEOUT_MS`    | Outbound fetch timeout per site    | `4000`            |
| `CONCURRENCY`   | Parallel outbound fetches          | `5`               |
| `MAX_BYTES`     | Max response size read per site    | `1048576` (1 MiB) |
| `MAX_REDIRECTS` | Redirect hop cap                   | `5`               |
| `TEST_PROFILE`  | Optional test profile selector     | `default`         |

Example (more strict and faster fail):

```bash
PORT=3001 STRATEGY=callbacks TIMEOUT_MS=2000 CONCURRENCY=2 MAX_REDIRECTS=2 node src/app.js
```

---

## Native Request Logging

This project uses a **native request logger** (no libraries) that prints:

`<ISO_TIME> <METHOD> <PATH> <STATUS> <DURATION_MS>`

Example:

```
2026-03-04T09:10:11.120Z GET /I/want/title?address=google.com 200 52.41ms
```

---

## API Usage

### Endpoint

`GET /I/want/title`

### Query Parameters

* `address` (repeatable): multiple websites are passed via multiple `address=` params.

Example:

```
/I/want/title?address=google.com&address=http://yahoo.com&address=asdasdasd
```

### Response

HTML:

```html
<!doctype html>
<html>
<head></head>
<body>
  <h1>Following are the titles of given websites:</h1>
  <ul>
    <li>google.com - "Google"</li>
    <li>http://yahoo.com - "Yahoo"</li>
    <li>asdasdasd - NO RESPONSE</li>
  </ul>
</body>
</html>
```

### Other Routes

All other routes return `404`.

---

## Test Cases (curl)

> Titles can change over time; assert on **structure + presence**, not exact title strings.

### 1) Basic success (two valid websites)

```bash
curl -s "http://localhost:3000/I/want/title?address=google.com&address=https://www.wikipedia.org"
```

Expected:

* HTTP 200
* HTML contains `<h1>Following are the titles of given websites:</h1>`
* `<li>` entries include `"..."` titles

---

### 2) Mixed valid + invalid hostname

```bash
curl -s "http://localhost:3000/I/want/title?address=google.com&address=asdasdasd"
```

Expected:

* `google.com - "..."` OR `NO RESPONSE` (if blocked)
* `asdasdasd - NO RESPONSE`

---

### 3) Missing scheme (normalization)

```bash
curl -s "http://localhost:3000/I/want/title?address=www.bbc.com"
```

Expected:

* Works without `http://` (service normalizes)
* Title or `NO RESPONSE` if blocked

---

### 4) Order preservation

```bash
curl -s "http://localhost:3000/I/want/title?address=example.com&address=google.com&address=wikipedia.org"
```

Expected:

* Output list appears in the same order: example → google → wikipedia

---

### 5) Empty query (no addresses)

```bash
curl -i "http://localhost:3000/I/want/title"
```

Expected:

* HTTP 200
* HTML with an empty `<ul>`

---

### 6) Non-HTTP scheme (should be rejected)

```bash
curl -s "http://localhost:3000/I/want/title?address=ftp://example.com"
```

Expected:

* `ftp://example.com - NO RESPONSE`

---

### 7) 404 for other routes (per requirements)

```bash
curl -i "http://localhost:3000/"
curl -i "http://localhost:3000/I/want"
curl -i "http://localhost:3000/I/want/titlex"
```

Expected:

* HTTP 404 for all

---

## Test Cases

Create a **GET** request:

**URL**

```
http://localhost:3000/I/want/title
```

**Params**

* `address` = `google.com`
* `address` = `http://yahoo.com`
* `address` = `asdasdasd`

 Expected: HTML response with titles and `NO RESPONSE` for failures.

> Add screenshots of:

* Params tab showing multiple `address` params
* Response body (HTML)
* Status code 200

---

## Strategy Parity Test (Same Output Shape)

Run the same request against all strategies:

```bash
npm run start:callbacks
curl -s "http://localhost:3000/I/want/title?address=google.com&address=asdasdasd"

npm run start:async
curl -s "http://localhost:3000/I/want/title?address=google.com&address=asdasdasd"

npm run start:promises
curl -s "http://localhost:3000/I/want/title?address=google.com&address=asdasdasd"
```

Expected:

* HTML output structure identical
* Ordering preserved
* Any unreachable site prints `NO RESPONSE`

---

## Optional Stress / Resilience Tests

### A) Fast-fail timeout test

```bash
TIMEOUT_MS=1 STRATEGY=promises node src/app.js
curl -s "http://localhost:3000/I/want/title?address=google.com&address=wikipedia.org"
```

Expected:

* Most results become `NO RESPONSE`
* Still returns HTTP 200 quickly

### B) Concurrency test (many addresses)

```bash
CONCURRENCY=2 STRATEGY=promises node src/app.js
curl -s "http://localhost:3000/I/want/title?address=example.com&address=google.com&address=wikipedia.org&address=example.com&address=google.com&address=wikipedia.org"
```

Expected:

* Order preserved
* No crash/hang

---

## Notes / Assumptions

* Some websites may block automated requests or require JS rendering; those will show as `NO RESPONSE`.
* Titles may change over time; validate the list format and presence rather than exact title strings.

---

## Author

Ali Akbar

