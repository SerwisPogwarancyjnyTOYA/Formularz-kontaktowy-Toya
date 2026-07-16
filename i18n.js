(() => {
  'use strict';
  const STORAGE_KEY = 'pgw-ui-language-v82';
  const LOCALES = {pl:'pl-PL', en:'en-GB'};
  const NAMES = {pl:'PL — Polski', en:'EN — English'};
  const UI = {
  "en": {
    "Formularz zapytania o części — Serwis Pogwarancyjny TOYA": "Spare parts enquiry form — TOYA After-Warranty Service",
    "Serwis Pogwarancyjny TOYA": "TOYA After-Warranty Service",
    "Krokowy formularz zapytania o części": "Step-by-step spare parts enquiry",
    "Język strony": "Page language",
    "Ładowanie formularza…": "Loading form…",
    "Gotowe": "Ready",
    "Nie udało się załadować danych": "Could not load the catalogue data",
    "Formularz zapytania o części": "Spare parts enquiry form",
    "Znajdź urządzenie, wybierz część i przygotuj zapytanie do serwisu.": "Find the machine, choose the required part and prepare a service enquiry.",
    "Najpierw wybierz urządzenie i potrzebne części. Potem uzupełnij dane kontaktowe. Na końcu otrzymasz gotową treść maila do": "First choose the machine and the required parts. Then add contact details. At the end you will get a ready-to-send email for",
    "1. Wybierz model": "1. Choose model",
    "2. Sprawdź rysunek": "2. Check drawing",
    "3. Dodaj części": "3. Add parts",
    "4. Skopiuj mail": "4. Copy email",
    "Urządzenie": "Machine",
    "Części": "Parts",
    "Dane": "Details",
    "Mail": "Email",
    "Wyszukaj urządzenie": "Find a machine",
    "Wpisz indeks modelu, np.": "Enter a model code, e.g.",
    "albo fragment nazwy.": "or part of the name.",
    "Indeks lub nazwa urządzenia": "Model code or machine name",
    "Marka urządzenia": "Machine brand",
    "Domyślnie szukamy we wszystkich markach. Filtr pomaga, gdy klient wie, z jakiej marki jest sprzęt.": "By default we search across all brands. Use the filter when the customer knows the brand of the product.",
    "Gdzie znaleźć indeks urządzenia?": "Where can I find the model code?",
    "Najczęściej jest na tabliczce znamionowej albo na etykiecie urządzenia. Wystarczy wpisać sam numer, np.": "It is usually on the rating plate or on the product label. You can enter just the number, e.g.",
    "bez myślnika też zadziała.": "without the dash will work as well.",
    "Wybierz części z listy": "Choose parts from the list",
    "Pozycje są z wybranego rysunku PDF. Dodaj potrzebne części i ustaw ilości.": "The items come from the selected PDF drawing. Add the required parts and set quantities.",
    "Lista części do uzupełnienia": "Parts list to be completed",
    "Rysunek PDF może być dostępny, ale lista pozycji nie jest jeszcze podpięta do formularza. Wpisz numer pozycji z rysunku albo opisz potrzebną część w następnym kroku.": "The PDF drawing may be available, but the item list has not yet been connected to the form. Enter the item number from the drawing or describe the required part in the next step.",
    "Przejdź dalej i opisz część": "Continue and describe the part",
    "Najprościej:": "The easiest way:",
    "znajdź numer pozycji na PDF-ie i wpisz go poniżej. Lista części jest dawkowana, żeby klient nie dostał całej tabeli naraz.": "find the item number on the PDF and enter it below. The parts list is shown in portions so the customer is not overwhelmed by the full table at once.",
    "Szukaj części w tym urządzeniu": "Search parts for this machine",
    "Poz.": "Item",
    "Indeks": "Code",
    "Nazwa": "Name",
    "Pokaż więcej części": "Show more parts",
    "Wróć do wyboru urządzenia": "Back to machine selection",
    "Przejdź do danych": "Continue to details",
    "Dane kontaktowe, faktura i wysyłka": "Contact, invoice and shipping details",
    "Kontakt jest wymagany, ale faktura i wysyłka są opcjonalne. Klient może dopytać o części bez uzupełniania wszystkich danych.": "Contact details are required, but invoice and shipping details are optional. The customer can ask about parts without filling in every field.",
    "Kontakt": "Contact",
    "Imię i nazwisko / firma kontaktowa": "Full name / contact company",
    "Email": "Email",
    "Telefon": "Phone",
    "Wystarczy email albo telefon. Im więcej danych klient poda, tym łatwiej będzie odpowiedzieć.": "An email address or phone number is enough. The more details the customer provides, the easier it is to reply.",
    "Numer seryjny urządzenia": "Machine serial number",
    "Opis części spoza bazy": "Part description outside the database",
    "Użyj tego pola, gdy nie ma listy części albo nie znasz indeksu. Warto dopisać numer pozycji z rysunku lub dołączyć zdjęcie tabliczki znamionowej oraz potrzebnej części.": "Use this field when there is no parts list or the part code is unknown. It is worth adding the item number from the drawing or attaching a photo of the rating plate and the required part.",
    "Opis potrzebnej części": "Required part description",
    "Faktura": "Invoice",
    "Chcę podać dane do faktury teraz": "I want to enter invoice details now",
    "Jeżeli klient nie potrzebuje faktury albo chce ustalić to później, ta sekcja nie blokuje przejścia dalej.": "If the customer does not need an invoice or wants to agree it later, this section does not block the next step.",
    "Nazwa firmy / osoba": "Company name / person",
    "Pobierz dane z NIP": "Fetch company data from tax ID",
    "Po wpisaniu NIP możesz spróbować automatycznie pobrać nazwę i adres firmy.": "After entering the tax ID you can try to fetch the company name and address automatically.",
    "Ulica i nr": "Street and number",
    "Kod pocztowy": "Postal code",
    "Miasto": "City",
    "Kod pocztowy może uzupełnić miejscowość, jeśli jest w lokalnej bazie strony.": "The postal code can fill in the city if it is available in the local site database.",
    "Wysyłka": "Shipping",
    "Chcę podać adres wysyłki teraz": "I want to enter the shipping address now",
    "Adres wysyłki jest opcjonalny. Jeśli klient go nie poda, w mailu zostanie informacja „do ustalenia”.": "The shipping address is optional. If the customer does not provide it, the email will state that it is to be agreed.",
    "Takie same jak do faktury": "Same as invoice details",
    "Odbiorca": "Recipient",
    "Miejscowość uzupełni się automatycznie, jeśli kod jest w lokalnej bazie.": "The city will be filled in automatically if the code is in the local database.",
    "Telefon dla kuriera": "Courier phone number",
    "Dodatkowa wiadomość": "Additional message",
    "Uwagi": "Notes",
    "Podgląd maila roboczego": "Draft email preview",
    "Treść aktualizuje się w tle. Do finalnego kroku przejdziesz, gdy będzie minimum kontaktu.": "The content updates in the background. You can proceed to the final step once the minimum contact details are provided.",
    "Wróć do części": "Back to parts",
    "Przejdź do gotowego maila": "Continue to ready email",
    "Podaj kontakt. Faktura i wysyłka są opcjonalne — nie blokują gotowego maila.": "Provide contact details. Invoice and shipping details are optional — they do not block the ready email.",
    "Gotowy mail do skopiowania": "Ready email to copy",
    "Skopiuj temat i treść, a następnie wyślij wiadomość na": "Copy the subject and body, then send the message to",
    "Adresat": "Recipient",
    "Temat": "Subject",
    "Treść": "Body",
    "Kopiuj treść maila": "Copy email body",
    "Kopiuj temat": "Copy subject",
    "Kopiuj komplet": "Copy all",
    "Popraw dane": "Edit details",
    "Zacznij od nowa": "Start over",
    "Aktualny krok": "Current step",
    "Wybierz urządzenie": "Choose a machine",
    "Zacznij od indeksu modelu. Kolejne informacje pojawią się po wyborze urządzenia.": "Start with the model code. More information will appear after you choose a machine.",
    "Postęp zapytania": "Enquiry progress",
    "Rysunek PDF załaduje się automatycznie": "PDF drawing will load automatically",
    "Dodaj części do zapytania": "Add parts to the enquiry",
    "Uzupełnij dane": "Fill in details",
    "Skopiuj mail": "Copy email",
    "Wybrane części": "Selected parts",
    "Brak wybranych części.": "No parts selected.",
    "Wyczyść": "Clear",
    "Rysunek PDF": "PDF drawing",
    "Lista części": "Parts list",
    "PDF": "PDF",
    "Otwórz w nowej karcie": "Open in a new tab",
    "Wybierz urządzenie, a rysunek pojawi się tutaj.": "Choose a machine and the drawing will appear here.",
    "Brak wybranych części": "No parts selected",
    "Wybierz część z listy albo opisz ją ręcznie.": "Choose a part from the list or describe it manually.",
    "Dalej": "Next",
    "Formularz zapytania o części. Bez cen i stanów magazynowych.": "Spare parts enquiry form. No prices or stock levels shown.",
    "np. YT-82200, 82200, polerka": "e.g. YT-82200, 82200, polisher",
    "pozycja, indeks, nazwa części": "item, code, part name",
    "podaj email lub telefon": "enter email or phone",
    "opcjonalnie": "optional",
    "np. pozycja 12 z rysunku, element z okolicy silnika/osłony/uchwytu, opis uszkodzonej części": "e.g. item 12 from the drawing, element near the motor/guard/handle, description of the damaged part",
    "np. 31-357": "e.g. 31-357",
    "np. pilne, preferowana forma kontaktu, dodatkowe informacje do serwisu": "e.g. urgent, preferred contact method, additional information for service",
    "Wybierz": "Choose",
    "Dodaj": "Add",
    "Dodano": "Added",
    "Nie znaleziono urządzenia z rysunkiem.": "No machine with a drawing was found.",
    "Nie ma urządzenia/rysunku — opiszę ręcznie": "No machine/drawing — I will describe it manually",
    "Spróbuj skrócić indeks, np. z": "Try shortening the code, e.g. from",
    "do": "to",
    "albo wpisać sam numer bez prefiksu.": "or enter just the number without the prefix.",
    "Tryb ręczny jest tylko awaryjny — dla urządzeń bez rysunku lub bez spisu części.": "Manual mode is only a fallback — for machines without a drawing or without a parts list.",
    "Podgląd": "Preview",
    "Otwórz PDF": "Open PDF",
    "Jeśli podgląd się nie załaduje, użyj przycisku": "If the preview does not load, use the",
    "Dla plików po naprawie formularz wybiera wersję scaloną albo standardową automatycznie.": "For repaired files the form automatically chooses the merged or standard version.",
    "standardowy podgląd": "standard preview",
    "wersja po standaryzacji": "standardised version",
    "najlepsza wersja do publikacji": "best version for publication",
    "plik źródłowy, nie główny PDF klienta": "source file, not the main customer-facing PDF",
    "plik w kolejce napraw/oceny publikacyjnej": "file in the repair/publication review queue",
    "SCALONE": "MERGED",
    "PDF OK": "PDF OK",
    "ZAPAS": "BACKUP",
    "DO POPRAWY": "TO FIX",
    "ZAMIENNIK": "REPLACEMENT",
    "Brak rysunku PDF dla wybranego opisu.": "No PDF drawing for the selected manual description.",
    "Opisz część ręcznie i dołącz zdjęcia do maila.": "Describe the part manually and attach photos to the email.",
    "Wczytuję rysunek PDF…": "Loading PDF drawing…",
    "Za chwilę pojawi się podgląd rysunku.": "The drawing preview will appear in a moment.",
    "Nie udało się załadować podglądu PDF. Użyj przycisku „Otwórz w nowej karcie”.": "Could not load the PDF preview. Use the “Open in a new tab” button.",
    "Wybierz lub opisz część": "Choose or describe a part",
    "Sprawdź rysunek PDF. Jeśli lista części nie jest dostępna, wpisz numer pozycji z rysunku albo krótki opis.": "Check the PDF drawing. If the parts list is not available, enter the item number from the drawing or a short description.",
    "Skopiuj gotowy mail": "Copy the ready email",
    "Na końcu otrzymasz gotowy temat i treść do wysłania na service@yato.pl.": "At the end you will get a ready subject and body to send to service@yato.pl.",
    "Wszystko gotowe — możesz przejść do gotowego maila. Faktura i wysyłka są opcjonalne.": "All set — you can continue to the ready email. Invoice and shipping details are optional.",
    "Najpierw dodaj część do zapytania albo wybierz tryb ręczny.": "First add a part to the enquiry or choose manual mode.",
    "Kontakt jest wystarczający. Fakturę i wysyłkę można dopisać teraz albo ustalić później.": "Contact details are sufficient. Invoice and shipping details can be added now or agreed later.",
    "Skopiowano treść maila.": "Email body copied.",
    "Skopiowano temat.": "Subject copied.",
    "Skopiowano komplet: adresat, temat i treść.": "Copied all: recipient, subject and body.",
    "Nie udało się skopiować automatycznie — zaznacz tekst ręcznie.": "Automatic copy failed — select the text manually.",
    "Kontakt nazwany": "Contact name provided",
    "Email wygląda poprawnie": "Email looks valid",
    "Telefon wygląda poprawnie": "Phone looks valid",
    "Podaj poprawny email albo telefon": "Enter a valid email address or phone number",
    "Brakuje osoby / nazwy kontaktowej": "Contact person / company name is missing",
    "Faktura opcjonalna — nie blokuje maila": "Invoice optional — it does not block the email",
    "NIP wygląda poprawnie": "Tax ID looks valid",
    "NIP wygląda podejrzanie": "Tax ID looks suspicious",
    "Kod pocztowy faktury OK": "Invoice postal code OK",
    "Uzupełnij kod faktury w formacie 00-000": "Enter the invoice postal code in 00-000 format",
    "Uzupełnij dane do faktury albo odznacz tę sekcję": "Fill in invoice details or turn this section off",
    "Wysyłka opcjonalna — może być do ustalenia": "Shipping optional — it can be agreed later",
    "Kod wysyłki OK": "Shipping postal code OK",
    "Uzupełnij kod wysyłki w formacie 00-000": "Enter the shipping postal code in 00-000 format",
    "Telefon dla kuriera OK": "Courier phone OK",
    "Telefon dla kuriera wygląda podejrzanie": "Courier phone looks suspicious",
    "Urządzenia": "Machines",
    "w zapytaniu": "in the enquiry",
    "model opisany ręcznie": "model described manually",
    "opis ręczny": "manual description",
    "pozycji": "items",
    "szt.": "pcs",
    "brak poprawnego emaila lub telefonu": "no valid email address or phone number",
    "dane wpisane": "details entered",
    "opcjonalnie pominięta": "optionally skipped",
    "Wpisz poprawny NIP: 10 cyfr.": "Enter a valid tax ID: 10 digits.",
    "Szukam danych firmy w rejestrze MF…": "Searching for company details in the tax register…",
    "Nie znaleziono firmy dla tego NIP. Dane można wpisać ręcznie.": "No company found for this tax ID. You can enter the details manually.",
    "NIP wygląda poprawnie — możesz pobrać dane firmy.": "Tax ID looks valid — you can fetch the company details.",
    "NIP ma 10 cyfr, ale suma kontrolna wygląda podejrzanie. Możesz sprawdzić lub wpisać dane ręcznie.": "The tax ID has 10 digits, but the checksum looks suspicious. You can check it or enter the data manually.",
    "Wpisz kod w formacie 00-000.": "Enter the code in 00-000 format.",
    "Nie mam tego kodu w lokalnej bazie — wpisz miejscowość ręcznie.": "This code is not in the local database — enter the city manually."
  }
};
  const sourceText = new WeakMap();
  const sourceAttr = new WeakMap();

  function supported(lang) { return Object.prototype.hasOwnProperty.call(NAMES, lang) ? lang : 'pl'; }
  function currentLang() { return supported(localStorage.getItem(STORAGE_KEY) || (window.PGW_CONFIG && window.PGW_CONFIG.defaultLanguage) || 'pl'); }
  function map() { return UI[currentLang()] || {}; }
  function preserveWhitespace(original, translated) {
    const start = String(original).match(/^\s*/)[0];
    const end = String(original).match(/\s*$/)[0];
    return start + translated + end;
  }
  function translateDynamic(text, lang) {
    if (lang === 'pl') return text;
    let t = String(text || '').trim();
    if (!t) return text;
    const dictionary = UI[lang] || {};
    if (dictionary[t]) return preserveWhitespace(text, dictionary[t]);
    const repl = [
      [/^Znaleziono ([\d\s.,]+) pasujących urządzeń( dla wybranej marki)?\.$/, (_, n, brand) => `Found ${n} matching machines${brand ? ' for the selected brand' : ''}.`],
      [/^Wpisz model urządzenia albo fragment nazwy\. Poniżej kilka przykładów\.$/, () => 'Enter a machine model or part of the name. A few examples are shown below.'],
      [/^([\d\s.,]+) rys\.$/, (_, n) => `${n} drawing(s)`],
      [/^([\d\s.,]+) części$/, (_, n) => `${n} parts`],
      [/^Pokaż więcej części \(([\d\s.,]+) pozostało\)$/, (_, n) => `Show more parts (${n} remaining)`],
      [/^Brakuje danych: (.+)\.$/, (_, fields) => `Missing details: ${translateMissingFields(fields, lang)}.`],
      [/^NIP ma (\d+)\/10 cyfr\.$/, (_, n) => `Tax ID has ${n}/10 digits.`],
      [/^Uzupełniono miejscowość: (.+)\.$/, (_, city) => `City filled in: ${city}.`],
      [/^Części: ([\d\s.,]+) • urządzeń: ([\d\s.,]+)$/, (_, p, d) => `Parts: ${p} • machines: ${d}`],
      [/^Opis ręczny: (.+)$/, (_, x) => `Manual description: ${x}`],
      [/^Urządzenie (\d+):/, (_, n) => `Machine ${n}:`],
      [/^Rysunek serwisowy (.+)$/, (_, x) => `Service drawing ${x}`],
      [/^Rysunek z listą części - ([\d\s.,]+) części$/, (_, n) => `Drawing with parts list — ${n} parts`],
      [/^Pobrano: (.+)\. Sprawdź dane przed wysłaniem\.$/, (_, company) => `Fetched: ${company}. Check the details before sending.`]
    ];
    for (const [rx, fn] of repl) {
      const m = t.match(rx);
      if (m) return preserveWhitespace(text, fn(...m));
    }
    return text;
  }
  function translateMissingFields(fields, lang) {
    const dict = {
      'imię i nazwisko / firma kontaktowa':'full name / contact company',
      'poprawny email albo telefon':'valid email address or phone number',
      'opis potrzebnej części':'required part description',
      'nazwa do faktury':'invoice name',
      'adres do faktury':'invoice address',
      'kod pocztowy faktury':'invoice postal code',
      'miasto faktury':'invoice city',
      'odbiorca wysyłki':'shipping recipient',
      'adres wysyłki':'shipping address',
      'kod pocztowy wysyłki':'shipping postal code',
      'miasto wysyłki':'shipping city',
      'telefon dla kuriera':'courier phone number'
    };
    return String(fields || '').split(',').map(x => dict[x.trim()] || x.trim()).join(', ');
  }
  function translateValue(value) { return translateDynamic(value, currentLang()); }

  function skipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest('script,style,textarea,pre,code')) return true;
    if (parent.closest('#mailBody,#draftMailPreview')) return true;
    return false;
  }
  function translateTextNodes(root) {
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return skipTextNode(node) || !node.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!sourceText.has(node)) sourceText.set(node, node.nodeValue);
      const src = sourceText.get(node);
      const out = translateValue(src);
      if (node.nodeValue !== out) node.nodeValue = out;
    }
  }
  function translateAttributes(root) {
    const attrs = ['placeholder','aria-label','title','value'];
    (root || document).querySelectorAll('[placeholder],[aria-label],[title],input[value][readonly]').forEach(el => {
      if (el.closest('#mailBody,#draftMailPreview')) return;
      let rec = sourceAttr.get(el);
      if (!rec) { rec = {}; sourceAttr.set(el, rec); }
      for (const attr of attrs) {
        if (!el.hasAttribute(attr)) continue;
        if (attr === 'value' && !(el.tagName === 'INPUT' && el.readOnly)) continue;
        if (!(attr in rec)) rec[attr] = el.getAttribute(attr);
        const translated = translateValue(rec[attr]);
        if (el.getAttribute(attr) !== translated) el.setAttribute(attr, translated);
      }
    });
  }
  function apply(root) {
    const lang = currentLang();
    document.documentElement.lang = lang;
    document.title = translateValue('Formularz zapytania o części — Serwis Pogwarancyjny TOYA');
    const sel = document.getElementById('languageSelect');
    if (sel && sel.value !== lang) sel.value = lang;
    translateTextNodes(root || document.body);
    translateAttributes(root || document);
  }
  function rebuildSelector() {
    const sel = document.getElementById('languageSelect');
    if (!sel) return;
    sel.innerHTML = Object.entries(NAMES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
    sel.value = currentLang();
    sel.addEventListener('change', () => {
      localStorage.setItem(STORAGE_KEY, supported(sel.value));
      apply(document.body);
      window.dispatchEvent(new CustomEvent('pgw:language-changed', {detail:{language:currentLang()}}));
    });
  }
  function observe() {
    const mo = new MutationObserver((mutations) => {
      if (observe._busy) return;
      observe._busy = true;
      requestAnimationFrame(() => {
        for (const m of mutations) {
          if (m.type === 'childList') m.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); else if (n.nodeType === 3 && n.parentElement) apply(n.parentElement); });
          if (m.type === 'characterData' && m.target && m.target.parentElement && !sourceText.has(m.target)) apply(m.target.parentElement);
          if (m.type === 'attributes' && m.target && !sourceAttr.has(m.target)) apply(m.target);
        }
        observe._busy = false;
      });
    });
    mo.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['placeholder','aria-label','title','value']});
  }
  window.PGW_I18N = {apply, currentLang, translate: translateValue, supportedLanguages: Object.keys(NAMES)};
  document.addEventListener('DOMContentLoaded', () => { rebuildSelector(); apply(document.body); observe(); });
})();
