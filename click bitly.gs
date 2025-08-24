// ✅ Apps Script για "Sneaker Tools" με Bitly API, Custom Links, Σχολια & Πλατφόρμα

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👟 Sneaker Tools')
    .addItem('🔤 Δημιουργία Captions', 'δημιουργίαCaptions')
    .addItem('🔗 Δημιουργία Bitly Links', 'δημιουργίαBitlyLinks')
    .addItem('📊 Ανάκτηση Clicks', 'ανάκτησηBitlyClicks')
    .addSeparator()
    .addItem('🧹 Εκκαθάριση', 'καθαρισμός')
    .addToUi();
}

function δημιουργίαCaptions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Κεντρικό');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const ενεργό = data[i][7];
    const sneaker = data[i][1];
    const usp = data[i][6];
    const γλώσσα = data[i][5];

    if (ενεργό.toString().toLowerCase() === 'ναι') {
      let caption = '';
      if (γλώσσα === 'el') {
        caption = `🔥 Νέο ${sneaker} | ${usp} #sneakers #style`;
      } else if (γλώσσα === 'en') {
        caption = `🔥 New ${sneaker} | ${usp} #sneakers #style`;
      } else if (γλώσσα === 'both') {
        caption = `🇬🇷 ${sneaker} | ${usp}\n\n🇬🇧 ${sneaker} | ${usp}`;
      }

      const πλατφόρμες = data[i][4].split(',');
      πλατφόρμες.forEach(platform => {
        const φύλλο = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(platform.trim());
        if (φύλλο) {
          φύλλο.appendRow([new Date(), sneaker, platform.trim(), caption, '#sneakers #style', '', '', '']);
        }
      });
    }
  }
  SpreadsheetApp.getUi().alert('✅ Τα captions δημιουργήθηκαν επιτυχώς.');
}

function δημιουργίαBitlyLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Κεντρικό');
  const data = sheet.getDataRange().getValues();
  const token = PropertiesService.getScriptProperties().getProperty('BITLY_TOKEN');
  const σήμερα = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');

  if (!token) {
    SpreadsheetApp.getUi().alert('⛔ Δεν βρέθηκε Bitly Token στις ρυθμίσεις.');
    return;
  }

  for (let i = 1; i < data.length; i++) {
    const ενεργό = data[i][7];
    const rawURL = data[i][2];
    const sneaker = data[i][1];
    const πλατφόρμες = data[i][4].split(',');

    if (ενεργό.toString().toLowerCase() === 'ναι') {
      πλατφόρμες.forEach(platform => {
        const trimmed = platform.trim();
        const longUrl = `${rawURL}?source=${trimmed.toLowerCase()}`;

        const slug = `${sneaker}-${trimmed}-${σήμερα}`
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');

        const result = callBitlyApi(longUrl, slug, token);

        if (result) {
          const φύλλο = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(trimmed);
          if (φύλλο) {
            const newRow = φύλλο.appendRow([new Date(), sneaker, trimmed, '', '', result.link, '', '']);
            const lastRow = φύλλο.getLastRow();
            φύλλο.getRange(lastRow, 6).setComment(`📌 Link για ${trimmed}`);

            if (result.slugUsed) {
              φύλλο.getRange(lastRow, 8).setValue('📌 Custom slug applied');
            } else {
              φύλλο.getRange(lastRow, 8).setValue('⚠️ Δεν έγινε δεκτό custom slug - χρησιμοποιήθηκε τυχαίο');
            }
          }
        }
      });
    }
  }
  SpreadsheetApp.getUi().alert('✅ Τα short links δημιουργήθηκαν επιτυχώς με σχολια & σημειώσεις.');
}

function callBitlyApi(longUrl, slug, token) {
  const apiUrl = 'https://api-ssl.bitly.com/v4/shorten';
  const payload = {
    long_url: longUrl,
    domain: 'bit.ly',
    custom_bitlink: `bit.ly/${slug}`
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(apiUrl, options);
  const result = JSON.parse(response.getContentText());

  if (result.link) {
    return { link: result.link, slugUsed: true };
  } else if (response.getResponseCode() === 400 && result.description && result.description.includes('CUSTOM_BITLINK_ALREADY_EXISTS')) {
    // Custom slug υπάρχει ήδη, προσπάθησε χωρίς slug
    const fallbackPayload = {
      long_url: longUrl,
      domain: 'bit.ly'
    };
    const fallbackOptions = {
      ...options,
      payload: JSON.stringify(fallbackPayload)
    };
    const fallbackResponse = UrlFetchApp.fetch(apiUrl, fallbackOptions);
    const fallbackResult = JSON.parse(fallbackResponse.getContentText());
    if (fallbackResult.link) {
      return { link: fallbackResult.link, slugUsed: false };
    }
  }

  Logger.log('Bitly Error:', result);
  return null;
}

function ανάκτησηBitlyClicks() {
  const token = PropertiesService.getScriptProperties().getProperty('BITLY_TOKEN');
  const σήμερα = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

  if (!token) {
    SpreadsheetApp.getUi().alert('⛔ Δεν βρέθηκε Bitly Token στις ρυθμίσεις.');
    return;
  }

  const πλατφόρμες = ['TikTok', 'Instagram', 'Pinterest', 'Facebook', 'YouTube'];
  πλατφόρμες.forEach(platform => {
    const φύλλο = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(platform);
    const data = φύλλο.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const shortLink = data[i][5];
      if (shortLink && shortLink.includes('bit.ly')) {
        const bitlink = shortLink.replace('https://', '').replace('http://', '');

        const apiUrl = `https://api-ssl.bitly.com/v4/bitlinks/${bitlink}/clicks/summary`;
        const options = {
          method: 'get',
          contentType: 'application/json',
          headers: {
            Authorization: `Bearer ${token}`
          },
          muteHttpExceptions: true
        };

        try {
          const response = UrlFetchApp.fetch(apiUrl, options);
          const result = JSON.parse(response.getContentText());

          if (result.total_clicks !== undefined) {
            φύλλο.getRange(i + 1, 7).setValue(result.total_clicks);
            φύλλο.getRange(i + 1, 7).setComment(`🎯 Clicks ανακτήθηκαν ${σήμερα}`);
          }
        } catch (e) {
          φύλλο.getRange(i + 1, 8).setValue(`❌ Σφάλμα clicks: ${e.message}`);
        }
      }
    }
  });

  SpreadsheetApp.getUi().alert('✅ Ολοκληρώθηκε η ανάκτηση clicks από Bitly.');
}

function καθαρισμός() {
  const πλατφόρμες = ['TikTok', 'Instagram', 'Pinterest', 'Facebook', 'YouTube'];
  πλατφόρμες.forEach(platform => {
    const φύλλο = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(platform);
    φύλλο.getRange('A2:H1000').clearContent();
  });
  SpreadsheetApp.getUi().alert('🧹 Τα δεδομένα καθαρίστηκαν από όλα τα φύλλα πλατφορμών.');
}
