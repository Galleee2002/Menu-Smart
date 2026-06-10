import { c as createComponent } from './astro-component_Wrkl5SJt.mjs';
import { h as addAttribute, p as renderHead, k as renderTemplate } from './entrypoint_CrfSiLr5.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Astro</title>${renderHead()}</head> <body> <h1>Astro</h1> </body></html>`;
}, "C:/Users/Usuario/Desktop/Menu-Smart/src/pages/index.astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Menu-Smart/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
