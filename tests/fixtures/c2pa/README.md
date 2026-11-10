# C2PA test images

Source: https://github.com/c2pa-org/public-testfiles (`legacy/1.4/image/jpeg/`), unmodified.
License: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), © the C2PA / Content Authenticity Initiative contributors.

| File | What it is |
|---|---|
| `adobe-20220124-A.jpg` | No Content Credentials |
| `adobe-20220124-C.jpg` | Valid Content Credentials signed with the C2PA test certificate (not on any trust list) |
| `adobe-20220124-E-dat-CA.jpg` | Content Credentials present, image data altered after signing |

`c2pa-test-intermediate-ca.pem` is the public certificate of the "C2PA Test Intermediate Root CA" (FOR TESTING ONLY) from https://github.com/contentauth/c2pa-rs (`sdk/tests/fixtures/certs/ps256.pub`, MIT / Apache-2.0). It is used as a trust anchor in tests to prove that a configured trust list turns a valid signature into `trusted`. It is a certificate, not a key, and must never be configured in production.

Used only by `tests/tools-c2pa.test.ts` and `tests/tools-review-fixes.test.ts`.
