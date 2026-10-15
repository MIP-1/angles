# Angle Relationships

An Arabic, right-to-left web app that shows a geometry figure with lines t, r, s, and v and angles numbered 1 to 12. Tap two angles and the app tells you the relationship between them.

**Live site:** https://mip-1.github.io/angles/

## Relationships

- Alternate interior angles (متبادلتان داخلياً)
- Alternate exterior angles (متبادلتان خارجياً)
- Same-side interior angles (متحالفتان)
- Corresponding angles (متناظرتان)

If a pair is not part of the curriculum, the app shows a red error: "خطأ: حالة غير مدروسة في المنهج" ("Error: case not covered in the curriculum").

## Features

- Arabic interface, right to left
- Light and dark themes, with your choice saved in the browser
- No frameworks or external libraries, and no internet needed once the page has loaded

## How to use

1. Open the live site.
2. Tap one angle, then tap a second angle.
3. The relationship appears below the figure.
4. Use the "مسح الاختيار" (clear selection) button to start over.

## Files

- `index.html`: the page
- `styles.css`: styling and themes
- `app.js`: tap handling and the interface
- `logic.js`: the function that decides the relationship
- `data.json`: angle data and the list of valid pairs
- `logo.png`: school logo
- `tests/`: automated tests (if uploaded)

## Running the tests

If you have Node.js and the `tests/` folder:

```bash
node tests/test.js
```
