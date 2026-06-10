import { c as createComponent } from './astro-component_Wrkl5SJt.mjs';
import { k as renderTemplate, o as renderComponent, p as renderHead, h as addAttribute } from './entrypoint_CrfSiLr5.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';

const EXAMPLE_MENU_THEMES = [
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Limpio, moderno y profesional"
  },
  {
    id: "warm-natural",
    name: "Warm & Natural",
    description: "Cálido, gastronómico y elegante"
  },
  {
    id: "bold-night",
    name: "Bold Night",
    description: "Oscuro, premium y distintivo"
  }
];
const DEFAULT_EXAMPLE_THEME_ID = "minimal-clean";
const EXAMPLE_THEME_STORAGE_KEY = "smartmenu-example-theme";
function isExampleMenuThemeId(value) {
  return value === "minimal-clean" || value === "warm-natural" || value === "bold-night";
}

const EXAMPLE_CATEGORIES = ["Pizzas", "Pastas", "Entradas", "Bebidas"];
const EXAMPLE_RESTAURANT = {
  name: "Bella Napoli",
  subtitle: "Cocina italiana artesanal",
  hours: "Abierto hoy · 12:00 - 23:30",
  location: "Palermo, Buenos Aires"
};
const EXAMPLE_PRODUCTS = [
  {
    id: "margherita",
    name: "Margherita",
    description: "Salsa de tomate, mozzarella fior di latte y albahaca fresca.",
    price: 12500,
    category: "Pizzas",
    available: true
  },
  {
    id: "prosciutto",
    name: "Prosciutto",
    description: "Mozzarella, jamón crudo, rúcula y aceite de oliva.",
    price: 14900,
    category: "Pizzas",
    available: true
  },
  {
    id: "diavola",
    name: "Diavola",
    description: "Salame picante, mozzarella, tomate y oliva.",
    price: 13800,
    category: "Pizzas",
    available: true
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmesano y provolone.",
    price: 15200,
    category: "Pizzas",
    available: true
  },
  {
    id: "napolitana",
    name: "Napolitana",
    description: "Tomate, mozzarella, ajo, orégano y anchoas.",
    price: 13100,
    category: "Pizzas",
    available: true
  },
  {
    id: "capricciosa",
    name: "Capricciosa",
    description: "Mozzarella, jamón cocido, champiñones y alcauciles.",
    price: 14500,
    category: "Pizzas",
    available: true
  },
  {
    id: "funghi",
    name: "Funghi",
    description: "Mozzarella, mix de hongos salteados y aceite de trufa.",
    price: 14200,
    category: "Pizzas",
    available: true
  },
  {
    id: "marinara",
    name: "Marinara",
    description: "Salsa de tomate, ajo, orégano y aceite de oliva.",
    price: 10800,
    category: "Pizzas",
    available: true
  },
  {
    id: "calzone",
    name: "Calzone Ripieno",
    description: "Masa rellena de ricotta, espinaca, mozzarella y tomate.",
    price: 13900,
    category: "Pizzas",
    available: false
  },
  {
    id: "fugazzeta",
    name: "Fugazzeta",
    description: "Cebolla caramelizada, mozzarella y orégano.",
    price: 12800,
    category: "Pizzas",
    available: true
  },
  {
    id: "burrata-pizza",
    name: "Burrata e Pomodoro",
    description: "Burrata fresca, tomates confitados y pesto de albahaca.",
    price: 16800,
    category: "Pizzas",
    available: true
  },
  {
    id: "romana",
    name: "Romana",
    description: "Masa fina, mozzarella, anchoas, alcaparras y romero.",
    price: 13600,
    category: "Pizzas",
    available: true
  },
  {
    id: "lasagna",
    name: "Lasagna della Casa",
    description: "Pasta casera, carne braseada, tomate y bechamel.",
    price: 16500,
    category: "Pastas",
    available: false
  },
  {
    id: "carbonara",
    name: "Spaghetti Carbonara",
    description: "Guanciale crocante, yema, pecorino y pimienta negra.",
    price: 14800,
    category: "Pastas",
    available: true
  },
  {
    id: "alfredo",
    name: "Fettuccine Alfredo",
    description: "Manteca, crema, parmesano y nuez moscada.",
    price: 14200,
    category: "Pastas",
    available: true
  },
  {
    id: "arrabbiata",
    name: "Penne Arrabbiata",
    description: "Salsa de tomate picante, ajo y perejil fresco.",
    price: 11900,
    category: "Pastas",
    available: true
  },
  {
    id: "ravioli",
    name: "Ravioli di Ricotta",
    description: "Raviolis caseros rellenos de ricotta y espinaca.",
    price: 15400,
    category: "Pastas",
    available: true
  },
  {
    id: "gnocchi",
    name: "Gnocchi al Pesto",
    description: "Ñoquis de papa con pesto genovés y parmesano.",
    price: 13800,
    category: "Pastas",
    available: true
  },
  {
    id: "bolognesa",
    name: "Tagliatelle Bolognesa",
    description: "Pasta fresca con ragú de carne cocido a fuego lento.",
    price: 15100,
    category: "Pastas",
    available: true
  },
  {
    id: "canelones",
    name: "Canelones de Ricotta",
    description: "Canelones gratinados con salsa bechamel y tomate.",
    price: 15900,
    category: "Pastas",
    available: true
  },
  {
    id: "amatriciana",
    name: "Penne All'Amatriciana",
    description: "Panceta, tomate San Marzano y pecorino romano.",
    price: 14600,
    category: "Pastas",
    available: true
  },
  {
    id: "lasagna-veg",
    name: "Lasagna Vegetariana",
    description: "Verduras asadas, ricotta, tomate y bechamel.",
    price: 15200,
    category: "Pastas",
    available: true
  },
  {
    id: "pappardelle",
    name: "Pappardelle al Ragù",
    description: "Cintas anchas con ragú de cordero y hierbas.",
    price: 17200,
    category: "Pastas",
    available: true
  },
  {
    id: "aglio-olio",
    name: "Spaghetti Aglio e Olio",
    description: "Ajo dorado, aceite de oliva, perejil y ají.",
    price: 10500,
    category: "Pastas",
    available: true
  },
  {
    id: "bruschetta",
    name: "Bruschetta",
    description: "Pan tostado, tomate cherry, albahaca y aceite de oliva.",
    price: 8700,
    category: "Entradas",
    available: true
  },
  {
    id: "carpaccio",
    name: "Carpaccio di Manzo",
    description: "Láminas de carne, rúcula, parmesano y limón.",
    price: 12400,
    category: "Entradas",
    available: true
  },
  {
    id: "burrata-entrada",
    name: "Burrata con Tomates",
    description: "Burrata cremosa, tomates heirloom y reducción balsámica.",
    price: 13200,
    category: "Entradas",
    available: true
  },
  {
    id: "caprese",
    name: "Insalata Caprese",
    description: "Mozzarella de búfala, tomate, albahaca y oliva.",
    price: 10900,
    category: "Entradas",
    available: true
  },
  {
    id: "focaccia",
    name: "Focaccia al Rosmarino",
    description: "Focaccia artesanal con sal marina y romero.",
    price: 7500,
    category: "Entradas",
    available: true
  },
  {
    id: "arancini",
    name: "Arancini Siciliani",
    description: "Croquetas de arroz rellenas de ragú y mozzarella.",
    price: 9800,
    category: "Entradas",
    available: true
  },
  {
    id: "caesar",
    name: "Ensalada Caesar",
    description: "Lechuga romana, croutons, parmesano y aderezo clásico.",
    price: 10200,
    category: "Entradas",
    available: true
  },
  {
    id: "provoleta",
    name: "Provoleta Gratinada",
    description: "Queso provolone fundido con orégano y aceite de oliva.",
    price: 9400,
    category: "Entradas",
    available: true
  },
  {
    id: "antipasto",
    name: "Antipasto della Casa",
    description: "Selección de embutidos, quesos, aceitunas y vegetales.",
    price: 14500,
    category: "Entradas",
    available: true
  },
  {
    id: "crema-zapallo",
    name: "Crema de Zapallo",
    description: "Crema suave de zapallo asado con croutons.",
    price: 8200,
    category: "Entradas",
    available: false
  },
  {
    id: "melanzane",
    name: "Melanzane alla Parmigiana",
    description: "Berenjenas gratinadas con salsa de tomate y mozzarella.",
    price: 11200,
    category: "Entradas",
    available: true
  },
  {
    id: "suppli",
    name: "Supplì al Telefono",
    description: "Arroz, ragú y mozzarella con centro filante.",
    price: 8900,
    category: "Entradas",
    available: true
  },
  {
    id: "limonata",
    name: "Limonata",
    description: "Limonada natural con menta y jengibre.",
    price: 5200,
    category: "Bebidas",
    available: true
  },
  {
    id: "agua-mineral",
    name: "Agua Mineral",
    description: "Agua sin gas 500 ml.",
    price: 2800,
    category: "Bebidas",
    available: true
  },
  {
    id: "agua-gas",
    name: "Agua con Gas",
    description: "Agua mineral con gas 500 ml.",
    price: 3e3,
    category: "Bebidas",
    available: true
  },
  {
    id: "coca-cola",
    name: "Coca-Cola",
    description: "Gaseosa 500 ml.",
    price: 3500,
    category: "Bebidas",
    available: true
  },
  {
    id: "cerveza",
    name: "Cerveza Artesanal",
    description: "Rubia italiana 500 ml.",
    price: 5800,
    category: "Bebidas",
    available: true
  },
  {
    id: "vino-tinto",
    name: "Copa de Vino Tinto",
    description: "Selección de la casa, crianza media.",
    price: 7200,
    category: "Bebidas",
    available: true
  },
  {
    id: "vino-blanco",
    name: "Copa de Vino Blanco",
    description: "Pinot Grigio fresco y frutal.",
    price: 7200,
    category: "Bebidas",
    available: true
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "Café italiano corto y concentrado.",
    price: 3200,
    category: "Bebidas",
    available: true
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Espresso con leche espumada y cacao.",
    price: 4200,
    category: "Bebidas",
    available: true
  },
  {
    id: "spritz",
    name: "Aperol Spritz",
    description: "Aperol, prosecco, soda y rodaja de naranja.",
    price: 8500,
    category: "Bebidas",
    available: true
  },
  {
    id: "te-frio",
    name: "Té Frío de Durazno",
    description: "Té negro frío con durazno natural.",
    price: 4500,
    category: "Bebidas",
    available: true
  },
  {
    id: "prosecco",
    name: "Copa de Prosecco",
    description: "Espumante italiano seco y fresco.",
    price: 7800,
    category: "Bebidas",
    available: false
  }
];
function formatExamplePrice(price) {
  return `$${price.toLocaleString("es-AR")}`;
}

const row = "_row_lm974_1";
const last = "_last_lm974_6";
const unavailable = "_unavailable_lm974_10";
const rowMain = "_rowMain_lm974_14";
const name$1 = "_name_lm974_21";
const price = "_price_lm974_29";
const description = "_description_lm974_37";
const status = "_status_lm974_45";
const styles$3 = {
	row: row,
	last: last,
	unavailable: unavailable,
	rowMain: rowMain,
	name: name$1,
	price: price,
	description: description,
	status: status
};

function ExampleProductCard({ product, isLast = false }) {
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: [styles$3.row, !product.available ? styles$3.unavailable : "", isLast ? styles$3.last : ""].filter(Boolean).join(" "),
      children: [
        /* @__PURE__ */ jsxs("div", { className: styles$3.rowMain, children: [
          /* @__PURE__ */ jsx("h3", { className: styles$3.name, children: product.name }),
          /* @__PURE__ */ jsx("span", { className: styles$3.price, children: formatExamplePrice(product.price) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: styles$3.description, children: [
          product.description,
          !product.available ? /* @__PURE__ */ jsx("span", { className: styles$3.status, children: "No disponible" }) : null
        ] })
      ]
    }
  );
}

const menu = "_menu_1ttc5_1";
const header = "_header_1ttc5_6";
const name = "_name_1ttc5_16";
const subtitle = "_subtitle_1ttc5_24";
const meta = "_meta_1ttc5_31";
const metaItem = "_metaItem_1ttc5_39";
const categoryBar = "_categoryBar_1ttc5_48";
const categoryTitle = "_categoryTitle_1ttc5_61";
const catalog = "_catalog_1ttc5_83";
const categorySection = "_categorySection_1ttc5_87";
const productList = "_productList_1ttc5_91";
const styles$2 = {
	menu: menu,
	header: header,
	name: name,
	subtitle: subtitle,
	meta: meta,
	metaItem: metaItem,
	categoryBar: categoryBar,
	categoryTitle: categoryTitle,
	catalog: catalog,
	categorySection: categorySection,
	productList: productList
};

const CATEGORY_BAR_HEIGHT = 40;
function ExamplePublicMenu({ stickyOffset = 0 }) {
  const headerRef = useRef(null);
  const sectionRefs = useRef(/* @__PURE__ */ new Map());
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeCategory, setActiveCategory] = useState(EXAMPLE_CATEGORIES[0]);
  const productsByCategory = useMemo(() => {
    const grouped = /* @__PURE__ */ new Map();
    for (const category of EXAMPLE_CATEGORIES) {
      grouped.set(
        category,
        EXAMPLE_PRODUCTS.filter((product) => product.category === category)
      );
    }
    return grouped;
  }, []);
  const activeCategories = EXAMPLE_CATEGORIES.filter(
    (category) => (productsByCategory.get(category)?.length ?? 0) > 0
  );
  const updateActiveCategory = useCallback(() => {
    if (headerHeight === 0 || activeCategories.length === 0) {
      return;
    }
    const anchor = stickyOffset + headerHeight + CATEGORY_BAR_HEIGHT;
    let nextCategory = activeCategories[0];
    let matched = false;
    for (let index = activeCategories.length - 1; index >= 0; index -= 1) {
      const category = activeCategories[index];
      const section = sectionRefs.current.get(category);
      if (!section) {
        continue;
      }
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= anchor + 4 && bottom > anchor + 4) {
        nextCategory = category;
        matched = true;
        break;
      }
    }
    if (!matched) {
      activeCategories.forEach((category) => {
        const section = sectionRefs.current.get(category);
        if (!section) {
          return;
        }
        if (section.getBoundingClientRect().top <= anchor + 4) {
          nextCategory = category;
        }
      });
    }
    setActiveCategory((prev) => prev === nextCategory ? prev : nextCategory);
  }, [activeCategories, headerHeight, stickyOffset]);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }
    const measure = () => setHeaderHeight(header.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    updateActiveCategory();
    window.addEventListener("scroll", updateActiveCategory, { passive: true });
    window.addEventListener("resize", updateActiveCategory);
    return () => {
      window.removeEventListener("scroll", updateActiveCategory);
      window.removeEventListener("resize", updateActiveCategory);
    };
  }, [updateActiveCategory]);
  const setSectionRef = useCallback((category, node) => {
    if (node) {
      sectionRefs.current.set(category, node);
    } else {
      sectionRefs.current.delete(category);
    }
  }, []);
  const cssVars = {
    "--sticky-offset": `${stickyOffset}px`,
    "--restaurant-header-height": `${headerHeight}px`,
    "--category-bar-height": `${CATEGORY_BAR_HEIGHT}px`
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$2.menu, style: cssVars, children: [
    /* @__PURE__ */ jsxs("header", { ref: headerRef, className: styles$2.header, children: [
      /* @__PURE__ */ jsx("h1", { className: styles$2.name, children: EXAMPLE_RESTAURANT.name }),
      /* @__PURE__ */ jsx("p", { className: styles$2.subtitle, children: EXAMPLE_RESTAURANT.subtitle }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.meta, children: [
        /* @__PURE__ */ jsxs("span", { className: styles$2.metaItem, children: [
          /* @__PURE__ */ jsx(Clock, { size: 13, "aria-hidden": true }),
          EXAMPLE_RESTAURANT.hours
        ] }),
        /* @__PURE__ */ jsxs("span", { className: styles$2.metaItem, children: [
          /* @__PURE__ */ jsx(MapPin, { size: 13, "aria-hidden": true }),
          EXAMPLE_RESTAURANT.location
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$2.categoryBar, children: /* @__PURE__ */ jsx("h2", { className: styles$2.categoryTitle, children: activeCategory }, activeCategory) }),
    /* @__PURE__ */ jsx("div", { className: styles$2.catalog, children: activeCategories.map((category) => {
      const products = productsByCategory.get(category) ?? [];
      return /* @__PURE__ */ jsx(
        "section",
        {
          ref: (node) => setSectionRef(category, node),
          className: styles$2.categorySection,
          "aria-label": category,
          children: /* @__PURE__ */ jsx("div", { className: styles$2.productList, children: products.map((product, productIndex) => /* @__PURE__ */ jsx(
            ExampleProductCard,
            {
              product,
              isLast: productIndex === products.length - 1
            },
            product.id
          )) })
        },
        category
      );
    }) })
  ] });
}

const toggle = "_toggle_1faxa_1";
const option = "_option_1faxa_11";
const active = "_active_1faxa_28";
const styles$1 = {
	toggle: toggle,
	option: option,
	active: active
};

function ExampleThemeToggle({ themeId, onThemeChange }) {
  return /* @__PURE__ */ jsx("div", { className: styles$1.toggle, role: "group", "aria-label": "Selector de estilo visual", children: EXAMPLE_MENU_THEMES.map((theme) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: [styles$1.option, themeId === theme.id ? styles$1.active : ""].filter(Boolean).join(" "),
      onClick: () => onThemeChange(theme.id),
      "aria-pressed": themeId === theme.id,
      title: theme.description,
      children: theme.name
    },
    theme.id
  )) });
}

const page$1 = "_page_o8pjx_1";
const toolbar = "_toolbar_o8pjx_9";
const label = "_label_o8pjx_22";
const styles = {
	page: page$1,
	toolbar: toolbar,
	label: label
};

function readStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_EXAMPLE_THEME_ID;
  }
  const stored = localStorage.getItem(EXAMPLE_THEME_STORAGE_KEY);
  if (isExampleMenuThemeId(stored)) {
    return stored;
  }
  return DEFAULT_EXAMPLE_THEME_ID;
}
function ExampleMenuDemo() {
  const toolbarRef = useRef(null);
  const [themeId, setThemeId] = useState(DEFAULT_EXAMPLE_THEME_ID);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeId(stored);
    document.documentElement.setAttribute("data-example-theme", stored);
  }, []);
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) {
      return;
    }
    const measure = () => setToolbarHeight(toolbar.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);
  const handleThemeChange = useCallback((nextThemeId) => {
    setThemeId(nextThemeId);
    localStorage.setItem(EXAMPLE_THEME_STORAGE_KEY, nextThemeId);
    document.documentElement.setAttribute("data-example-theme", nextThemeId);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: styles.page, children: [
    /* @__PURE__ */ jsxs("div", { ref: toolbarRef, className: styles.toolbar, children: [
      /* @__PURE__ */ jsx("span", { className: styles.label, children: "Vista de ejemplo" }),
      /* @__PURE__ */ jsx(ExampleThemeToggle, { themeId, onThemeChange: handleThemeChange })
    ] }),
    /* @__PURE__ */ jsx(ExamplePublicMenu, { stickyOffset: toolbarHeight })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Example = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Example;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"', `><title>SmartMenu — Vista de ejemplo</title><meta name="description" content="Demostración visual de un menú digital SmartMenu con distintos estilos para restaurantes."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"><script>
      (function () {
        var key = 'smartmenu-example-theme';
        var stored = localStorage.getItem(key);
        var valid = ['minimal-clean', 'warm-natural', 'bold-night'];
        var theme = valid.indexOf(stored) !== -1 ? stored : 'minimal-clean';
        document.documentElement.setAttribute('data-example-theme', theme);
      })();
    <\/script>`, "</head> <body> ", " </body></html>"])), addAttribute(Astro2.generator, "content"), renderHead(), renderComponent($$result, "ExampleMenuDemo", ExampleMenuDemo, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Desktop/Menu-Smart/src/components/example-menu/ExampleMenuDemo", "client:component-export": "ExampleMenuDemo" }));
}, "C:/Users/Usuario/Desktop/Menu-Smart/src/pages/example.astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Menu-Smart/src/pages/example.astro";
const $$url = "/example";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Example,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
