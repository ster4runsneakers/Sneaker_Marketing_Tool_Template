// ✅ Apps Script για Sneaker Tools με Captions, Bitly, Clicks, USP από Περιγραφή + Μετάφραση

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👟 Sneaker Tools')
    .addItem('🔤 Δημιουργία Captions', 'δημιουργίαCaptions')
    .addItem('🔗 Δημιουργία Bitly Links', 'δημιουργίαBitlyLinks')
    .addItem('📊 Ανάκτηση Clicks', 'ανάκτησηBitlyClicks')
    .addItem('💡 Απόκτηση USP από Περιγραφή', 'εξαγωγήUSP')
    .addSeparator()
    .addItem('🧹 Εκκαθάριση', 'καθαρισμός')
    .addToUi();
}

// ✳️ Δημιουργία USP (EN) & μετάφραση σε EL με βάση περιγραφή προϊόντος
function εξαγωγήUSP() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Κεντρικό');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const ενεργό = data[i][7];
    const url = data[i][2];
    const υπάρχονUSP = data[i][6];
    const υπάρχονUSP_EL = data[i][8];

    if (ενεργό.toString().toLowerCase() === 'ναι' && url && !υπάρχονUSP) {
      try {
        const html = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
        const description = extractBestDescription(html);

        if (description) {
          const uspEN = generateUSP(description);
          const uspEL = LanguageApp.translate(uspEN, 'en', 'el');

          sheet.getRange(i + 1, 7).setValue(uspEN); // στήλη G
          sheet.getRange(i + 1, 9).setValue(uspEL); // στήλη I
        } else {
          sheet.getRange(i + 1, 7).setValue('❌ Δεν βρέθηκε περιγραφή');
        }
      } catch (e) {
        sheet.getRange(i + 1, 7).setValue(`❌ Σφάλμα: ${e.message}`);
      }
    }
  }
  SpreadsheetApp.getUi().alert('✅ Ολοκληρώθηκε η εξαγωγή USP και μετάφραση.');
}

// 🔍 Εύρεση περιγραφής από meta tags ή <p>
function extractBestDescription(html) {
  const patterns = [
    /<meta name="description" content="([^"]+)"/i,
    /<meta property="og:description" content="([^"]+)"/i,
    /<meta name="keywords" content="([^"]+)"/i,
    /<p[^>]*>(.*?)<\/p>/i
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = html.match(patterns[i]);
    if (match && match[1]) {
      return match[1].replace(/<[^>]*>/g, '').trim();
    }
  }
  return null;
}

// 🧠 Μετατροπή περιγραφής σε USP
function generateUSP(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('comfort')) return 'All-day comfort';
  if (lower.includes('lightweight')) return 'Ultra-light design';
  if (lower.includes('fashion')) return 'Stylish & modern look';
  if (lower.includes('support')) return 'Great support for everyday use';
  if (lower.includes('durable')) return 'Built to last';

  return trimmed.length > 80 ? trimmed.substring(0, 80) + '…' : trimmed;
}
