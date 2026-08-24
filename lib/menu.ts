import type { Category, MenuItem } from "./types";

export const MENU: MenuItem[] = [
  // ── Эспрессо-бар ──────────────────────────────
  { id: 1,  name: "Раф",              subtitle: "«Тёмный шоколад»", description: "33% сливки · двойной эспрессо · горькое какао ручной обжарки", price: 380, basePrice: 380, category: "espresso",    icon: "raf",         featured: true,  customizable: true  },
  { id: 2,  name: "Латте",             description: "молочный, мягкая пенка",                                      price: 320, basePrice: 320, category: "espresso",    icon: "latte",       customizable: true  },
  { id: 3,  name: "Капучино",          description: "классика, плотная пена",                                      price: 290, basePrice: 290, category: "espresso",    icon: "cappuccino",  customizable: true  },
  { id: 4,  name: "Флэт уайт",         description: "двойной ристретто, бархатное молоко",                          price: 290, basePrice: 290, category: "espresso",    icon: "flat",        customizable: true  },
  { id: 5,  name: "Американо",         description: "эспрессо и горячая вода",                                     price: 180, basePrice: 180, category: "espresso",    icon: "americano",   customizable: true  },
  { id: 6,  name: "Эспрессо",          description: "одинарный · 30 мл",                                            price: 140, basePrice: 140, category: "espresso",    icon: "espresso"                        },
  { id: 7,  name: "Двойной эспрессо",  description: "концентрат · 60 мл",                                           price: 200, basePrice: 200, category: "espresso",    icon: "espresso"                        },
  { id: 8,  name: "Матча латте",       description: "японская матча, овсяное молоко",                              price: 340, basePrice: 340, category: "espresso",    icon: "matcha",      customizable: true  },
  { id: 9,  name: "Какао",             subtitle: "«Тёмное»", description: "горький шоколад 72%, сливки, щепотка соли", price: 310, basePrice: 310, category: "espresso",    icon: "cocoa"                            },

  // ── Альтернатива ──────────────────────────────
  { id: 10, name: "Аэропресс",         description: "фильтрованный · яркая кислотность",                            price: 260, basePrice: 260, category: "alternative", icon: "alt",         featured: true                     },
  { id: 11, name: "Пуровер V60",       description: "однородное экстрагирование, чистый вкус",                       price: 280, basePrice: 280, category: "alternative", icon: "alt"                              },
  { id: 12, name: "Холодный кофе",     description: "cold brew 12ч настаивания",                                    price: 320, basePrice: 320, category: "alternative", icon: "alt"                              },

  // ── Десерты ───────────────────────────────────
  { id: 13, name: "Круассан миндальный", description: "Свежая выпечка, крем-брюле",                                 price: 260, basePrice: 260, category: "desserts",    icon: "croissant",   featured: true                     },
  { id: 14, name: "Чизкейк",           subtitle: "«Тирамису»", description: "маскарпоне, эспрессо, савоярди",           price: 320, basePrice: 320, category: "desserts",    icon: "cheesecake"                       },
];

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "espresso",    label: "Эспрессо"     },
  { key: "alternative", label: "Альтернатива" },
  { key: "desserts",    label: "Десерты"      },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  espresso:    "Эспрессо",
  alternative: "Альтернатива",
  desserts:    "Десерты",
};

/** Найти позицию меню по id (undefined если не существует) */
export function getMenuItem(id: number): MenuItem | undefined {
  return MENU.find((m) => m.id === id);
}
