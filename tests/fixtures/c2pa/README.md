# C2PA test images

Source: https://github.com/c2pa-org/public-testfiles (`legacy/1.4/image/jpeg/`), unmodified.
License: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), © the C2PA / Content Authenticity Initiative contributors.

| File | What it is |
|---|---|
| `adobe-20220124-A.jpg` | No Content Credentials |
| `adobe-20220124-C.jpg` | Valid Content Credentials signed with the C2PA test certificate (not on any trust list) |
| `adobe-20220124-E-dat-CA.jpg` | Content Credentials present, image data altered after signing |

Used only by `tests/tools-c2pa.test.ts`.
