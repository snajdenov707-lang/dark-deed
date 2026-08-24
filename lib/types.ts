export type Category = "espresso" | "alternative" | "desserts";

/** Тип иллюстрации для карточки */
export type IconVariant =
  | "raf"          // сливочная чашка с какао-крапом
  | "latte"        // молочная с бежевой пенкой
  | "cappuccino"   // молочная с белой плотной пеной
  | "flat"         // короткий стакан
  | "americano"    // тёмная чашка без пены
  | "espresso"     // маленькая эспрессо-чашка
  | "matcha"       // зелёная чашка
  | "cocoa"        // какао с шапкой сливок
  | "alt"          // альтернатива (V60/аэропресс/cold brew) — стеклянная колба
  | "croissant"    // круассан
  | "cheesecake";  // кусок торта

export interface MenuItem {
  id: number;
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  category: Category;
  /** Базовая цена — от неё считаются добавки в корзине */
  basePrice: number;
  /** Какую иллюстрацию рисовать в карточке */
  icon: IconVariant;
  /** Показывать ли большую hero-карточку на главной (первый совпавший в категории) */
  featured?: boolean;
  /** Позволяет ли настраивать размер / молоко / шоты в карточке товара */
  customizable?: boolean;
}

export interface Order {
  id: string;
  total: number;
  method: "pickup" | "table";
  paymentMethod: "sbp" | "card" | "bonus";
  scheduledTime?: string;
  status: "accepted" | "preparing" | "ready" | "issued";
  createdAt: string;
}
