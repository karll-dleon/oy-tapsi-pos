// ==========================================================================
// 1. MENU CATALOG, CATEGORIES & REGISTERED ACCOUNTS
// ==========================================================================

export const CATEGORIES = [
  "ALL",
  "GOTO",
  "PASTIL MEALS",
  "SIOMAI MEALS",
  "SILOG MEALS",
  "PALUTO MEALS",
  "SIZZLING MEALS",
  "PARES MEALS",
  "DRINKS",
  "EXTRAS"
];

export const MENU_ITEMS = [
  // GOTO
  { id: "goto-1", name: "GOTO", category: "GOTO", price: 30, available: true },
  { id: "goto-2", name: "GOTO w/ EGG", category: "GOTO", price: 40, available: true },
  { id: "goto-3", name: "GOTO w/ Lechon", category: "GOTO", price: 75, available: true },
  { id: "goto-4", name: "LUMPIA TOGUE", category: "GOTO", price: 20, available: true },
  { id: "goto-5", name: "TOKWA", category: "GOTO", price: 15, available: true },

  // PASTIL MEALS
  { id: "pastil-1", name: "CHICKEN", category: "PASTIL MEALS", price: 25, available: true },
  { id: "pastil-2", name: "BEEF", category: "PASTIL MEALS", price: 45, available: true },
  { id: "pastil-3", name: "PORK LECHON", category: "PASTIL MEALS", price: 40, available: true },
  { id: "pastil-4", name: "ADD'L: HARD BOILED EGG", category: "PASTIL MEALS", price: 18, available: true },
  { id: "pastil-5", name: "ADD'L: CHOPPED (kamatis at pipino)", category: "PASTIL MEALS", price: 15, available: true },

  // SIOMAI MEALS
  { id: "siomai-1", name: "PARESIO (2pcs. Siomai + rice + Pares sauce)", category: "SIOMAI MEALS", price: 50, available: true },
  { id: "siomai-2", name: "SIOMAI per piece", category: "SIOMAI MEALS", price: 15, available: true },

  // SILOG MEALS
  { id: "silog-1", name: "TAPSILOG", category: "SILOG MEALS", price: 100, available: true },
  { id: "silog-2", name: "PORKSILOG", category: "SILOG MEALS", price: 90, available: true },
  { id: "silog-3", name: "CHICKSILOG", category: "SILOG MEALS", price: 110, available: true },
  { id: "silog-4", name: "LIEMPOSILOG", category: "SILOG MEALS", price: 110, available: true },
  { id: "silog-5", name: "TOSILOG", category: "SILOG MEALS", price: 90, available: true },
  { id: "silog-6", name: "BANGSILOG", category: "SILOG MEALS", price: 90, available: true },
  { id: "silog-7", name: "SPAMSILOG", category: "SILOG MEALS", price: 90, available: true },
  { id: "silog-8", name: "SHANGSILOG", category: "SILOG MEALS", price: 80, available: true },
  { id: "silog-9", name: "HUNGARIANSILOG", category: "SILOG MEALS", price: 90, available: true },

  // PALUTO MEALS
  { id: "paluto-1", name: "CANTON (Special)", category: "PALUTO MEALS", price: 130, available: true },
  { id: "paluto-2", name: "BEEF BROCOLLI", category: "PALUTO MEALS", price: 130, available: true },
  { id: "paluto-3", name: "PORK SINIGANG", category: "PALUTO MEALS", price: 130, available: true },
  { id: "paluto-4", name: "BANGUS SINIGANG", category: "PALUTO MEALS", price: 140, available: true },
  { id: "paluto-5", name: "PORK CHOPSUEY", category: "PALUTO MEALS", price: 130, available: true },

  // SIZZLING MEALS
  { id: "sizzling-1", name: "TAPA TIPS", category: "SIZZLING MEALS", price: 120, available: true },
  { id: "sizzling-2", name: "LECHON SISIG", category: "SIZZLING MEALS", price: 120, available: true },
  { id: "sizzling-3", name: "PORKCHOPS", category: "SIZZLING MEALS", price: 110, available: true },
  { id: "sizzling-4", name: "CHICKEN", category: "SIZZLING MEALS", price: 120, available: true },
  { id: "sizzling-5", name: "LIEMPO", category: "SIZZLING MEALS", price: 110, available: true },
  { id: "sizzling-6", name: "BANGUS", category: "SIZZLING MEALS", price: 100, available: true },
  { id: "sizzling-7", name: "HUNGARIAN", category: "SIZZLING MEALS", price: 100, available: true },

  // PARES MEALS
  { id: "pares-1", name: "PARES LECHON", category: "PARES MEALS", price: 90, available: true },
  { id: "pares-2", name: "PARES BEEF", category: "PARES MEALS", price: 120, available: true },
  { id: "pares-3", name: "PARES BEEF MAMI", category: "PARES MEALS", price: 80, available: true },

  // DRINKS
  { id: "drinks-1", name: "SOFTDRINKS 8oz.", category: "DRINKS", price: 15, available: true },
  { id: "drinks-2", name: "SOFTDRINKS 1.5", category: "DRINKS", price: 90, available: true },
  { id: "drinks-3", name: "JUICE IN CAN", category: "DRINKS", price: 50, available: true },
  { id: "drinks-4", name: "FRUIT SODA", category: "DRINKS", price: 35, available: true },

  // EXTRAS
  { id: "extras-1", name: "PLAIN RICE", category: "EXTRAS", price: 15, available: true },
  { id: "extras-2", name: "FRIED RICE", category: "EXTRAS", price: 20, available: true },
  { id: "extras-3", name: "HOT COFFEE", category: "EXTRAS", price: 20, available: true },
  { id: "extras-4", name: "SOUP", category: "EXTRAS", price: 5, available: true }
];

export const accounts = [
  {
    name: "Karl De Leon",
    email: "karlitodrew05@gmail.com",
    password: "Kayakona_crushkita05",
    badge: "ADMIN USER 123",
    shift: "SHIFT #2",
    avatar: "KD"
  }
];