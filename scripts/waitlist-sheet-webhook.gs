/**
 * RORA waitlist → Google Sheet webhook.
 *
 * Paste this into a Google Sheet's Extensions ▸ Apps Script editor, set SHARED_SECRET below to
 * match the SHEET_SECRET env var (locally: .env.local; in Vercel: project env vars), then deploy
 * (Deploy ▸ New deployment ▸ Web app, execute as "Me", access "Anyone"). Copy the resulting /exec
 * URL into GOOGLE_SHEET_WEBHOOK_URL. Full walkthrough: SETUP-WAITLIST.md in the repo root.
 */

// Must match the SHEET_SECRET env var. Set this in the Apps Script editor directly (never commit
// the real value — this file is version-controlled and the secret must stay out of git history).
const SHARED_SECRET = 'REPLACE_WITH_A_LONG_RANDOM_STRING';

// Apps Script web apps always answer HTTP 200 (there's no way to set another status code), so the
// caller must check the "ok" field in the JSON body rather than the HTTP status — route.ts does.
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && body.secret !== SHARED_SECRET) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0 && Array.isArray(body.headers)) {
      sheet.appendRow(body.headers);
      sheet.getRange(1, 1, 1, body.headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(body.row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Visiting the deployed URL in a browser hits this — handy to confirm the deployment is live.
function doGet() {
  return json_({ ok: true, note: 'RORA waitlist webhook is live. POST signups here.' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
