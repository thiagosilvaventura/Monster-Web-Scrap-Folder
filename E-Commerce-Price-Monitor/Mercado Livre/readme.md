# E-Commerce Price Monitor (Mercado Livre Edition)

A resilient, Vanilla JavaScript web scraper and UI injector tailored for Mercado Livre. Unlike standard static sites, Mercado Livre employs aggressive security policies and dynamic DOM rendering engines. This tool bypasses those hurdles to extract, analyze, and export product data entirely on the client-side.

## ⚠️ Architectural Challenges & Solutions

While the AliExpress version relied on static class selectors and straightforward DOM manipulation, Mercado Livre introduced significant architectural barriers that required a more robust approach.

### 1. Content Security Policy (CSP) Blocking
Mercado Livre utilizes a strict Content Security Policy that blocks unauthorized inline `<style>` tags, preventing standard UI injection.
**Solution:** The script actively searches the DOM for an existing, authorized `nonce` cryptographic key and clones it into our custom injected stylesheet. As a fallback, dynamic inline styles (`element.style.border`) are used for highlight animations.

### 2. Polycard Rendering Engine (Dynamic Classes)
Mercado Livre recently migrated to a "Polycard" component system. Core wrapper classes frequently change or alternate between `.ui-search-layout__item`, `.andes-card`, and `.poly-card`.
**Solution:** A structural and semantic extraction engine. Instead of searching for the card first, the script queries stable anchor (`<a>`) or title (`<h2>`, `<h3>`) tags, and uses the `closest()` method to recursively find the parent container.

### 3. Segmented Price Architecture
Unlike AliExpress, which renders the price as a single string, Mercado Livre's "Andes" design system splits prices into distinct DOM nodes for currencies, fractions, and cents. It also keeps hidden "original" prices in the DOM.
**Solution:** Node-specific traversal. The script filters out struck-through prices (`<del>`, `<s>`), extracts the `.andes-money-amount__fraction` and `.andes-money-amount__cents` separately, and concatenates them into a standardized float.

---

## 📊 Architecture Comparison: AliExpress vs. Mercado Livre

| Technical Feature | AliExpress Approach | Mercado Livre Approach |
| :--- | :--- | :--- |
| **UI Injection Security** | Open DOM. Direct `<style>` tag injection. | Strict CSP. Requires `nonce` capture and inline `element.style` fallbacks. |
| **Product Node Targeting** | Static class selection (`.search-card-item`). | Semantic parent traversal (`linkEl.closest('.poly-card, .andes-card')`). |
| **Price Data Extraction** | Regex on a single string (`.replace(/[^\d,]/g, '')`). | Composite extraction (Fraction node + Cents node concatenation). |
| **Data Integrity** | Iterates over parent cards directly. | Iterates over titles/links, filtering duplicates via `Set()`. |

---

## 🛠 Code Snippets: Resilient Engineering

### CSP Nonce Hijacking
Bypassing the Content Security Policy by borrowing the host's cryptographic token.
```javascript
const style = d.createElement('style');
style.id = 'tmx-pro-max-styles';

// Attempt to capture Mercado Livre's security nonce
const secureTag = d.querySelector('[nonce]');
if (secureTag && secureTag.nonce) {
    style.setAttribute('nonce', secureTag.nonce);
}
d.head.appendChild(style);
```
<img width="1884" height="929" alt="image" src="https://github.com/user-attachments/assets/fd68ff92-a03d-4e06-bdbb-a94a126569ce" />

<img width="1094" height="627" alt="image" src="https://github.com/user-attachments/assets/d32fef3b-b547-487d-939b-2909cfad3ddb" />


### Semantic DOM Traversal
Ignoring volatile wrapper classes and building upward from stable child nodes.
```javascript
const seenTitles = new Set();
const links = Array.from(d.querySelectorAll('a'));

links.forEach(linkEl => {
    // Rely on H2/H3 semantics instead of volatile classes
    const titleEl = linkEl.querySelector('h2, h3');
    if (!titleEl) return;
    
    // Build upward to find the true container
    const card = linkEl.closest('.poly-card, .andes-card, .ui-search-layout__item');
    if (!card) return;
    // ...
});
```

### Composite Price Extraction & Ghost Price Filtering
Avoiding old crossed-out prices and rebuilding the split price nodes.
```javascript
const fractionEls = Array.from(card.querySelectorAll('.andes-money-amount__fraction'));

// Filter out struck-through promotional prices
let activeFractionEl = fractionEls.find(el => {
    const style = window.getComputedStyle(el);
    return style.textDecorationLine !== 'line-through' && !el.closest('s') && !el.closest('del');
}) || fractionEls[0];

let fraction = activeFractionEl.innerText.replace(/\D/g, ''); 
const centsEl = activeFractionEl.parentElement.querySelector('.andes-money-amount__cents');
const cents = centsEl ? centsEl.innerText.replace(/\D/g, '') : '00';

let parsedPrice = parseFloat(`${fraction}.${cents}`);
```

## 🚀 How to Run

1. Navigate to any Mercado Livre search results page.
2. Scroll to the absolute bottom of the page to trigger the lazy-loading of all Polycard elements.
3. Open the browser's Developer Tools (`F12`) and navigate to the **Console** tab.
4. Paste the script and hit `Enter`. 
5. The Floating Control Panel will appear. Click **Run Scraper** to initialize data extraction.
