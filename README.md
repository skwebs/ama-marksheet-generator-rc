# Marksheet Generator — Anshu Memorial Academy

React + Vite 8 marksheet generator with secure dependencies and persistent settings.

## Requirements

- **Node.js** 20.19+ or 22.12+ (required by Vite 8)
- **npm** 9+

## Setup

```bash
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

## Assets

Place the following in `public/assets/`:

| File | Description |
|---|---|
| `ama300.webp` | School logo |
| `bbbp300.webp` | Beti Bachao Beti Padhao logo |
| `ama-128x128-0.15.webp` | Watermark background |

## Persistent Settings

Exam type, session, date, and subjects are **auto-saved to localStorage** — no need to re-enter them on each visit. Uses `useLocalStorage` hook (wraps `useState` + `useEffect`).

localStorage keys:
- `ama_examType`
- `ama_session`
- `ama_signDate`
- `ama_subjectsRaw`

## CSV Column Reference

### Required
`name`, `mother`, `father`, `class`, `roll`

### Optional
`section`, `dob`, `address`, `attendance`, `position`, `remarks`

### Marks (per subject)
Columns are derived from subject names. e.g. subject **"S.Science"** → key `sscience`:
- `sscience_written` — written marks
- `sscience_oral` — oral marks
- `sscience_full` *(optional)* — full marks, defaults to 100 if absent

Click **"Download sample CSV"** in Step 3 to get a ready-made template.

## Security

`xlsx` (SheetJS community) was replaced due to known vulnerabilities (Prototype Pollution, ReDoS):

| Old | New | Reason |
|---|---|---|
| `xlsx` | `exceljs` | No known vulnerabilities, actively maintained |
| `xlsx` | `papaparse` | Fast, secure CSV parsing |

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^8.0.3 | Build tool (Rolldown-powered) |
| `@vitejs/plugin-react` | ^6.0.1 | React Fast Refresh via Oxc |
| `tailwindcss` + `@tailwindcss/vite` | ^4.1.0 | Utility CSS |
| `react` + `react-dom` | ^19.1.0 | UI framework |
| `exceljs` | ^4.4.0 | Excel parsing (replaces `xlsx`) |
| `papaparse` | ^5.5.3 | CSV parsing (replaces `xlsx`) |
| `qrcode` | ^1.5.4 | QR code generation |

## Project Structure

```
src/
├── App.jsx                       # Root state + orchestration
├── main.jsx                      # React entry point
├── index.css                     # Tailwind v4 + print styles
├── hooks/
│   └── useLocalStorage.js        # Persistent state hook
├── components/
│   ├── GeneratorUI.jsx           # Non-printable 4-step UI
│   ├── MarksheetPage.jsx         # One A4 marksheet per student
│   └── QRBox.jsx                 # QR code component
└── utils/
    ├── grading.js                # Grade calc, date helpers
    ├── parseFile.js              # exceljs + papaparse parser
    └── sampleCsv.js              # Sample CSV builder
```
