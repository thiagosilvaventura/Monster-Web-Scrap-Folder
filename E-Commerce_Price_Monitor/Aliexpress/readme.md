# E-Commerce Price Monitor (AliExpress)

<img width="1836" height="852" alt="image" src="https://github.com/user-attachments/assets/cd9fda95-efd0-4714-a7f0-4084f112d905" />





<img width="1876" height="869" alt="image" src="https://github.com/user-attachments/assets/2d55c80b-4426-4240-ac5c-833ca7e7aefe" />




<img width="1192" height="391" alt="image" src="https://github.com/user-attachments/assets/e2152527-bb17-4f7d-86b2-108eff606405" />



A Vanilla JavaScript web scraper and UI injector designed to extract, analyze, and export product data directly from the AliExpress search results page. This tool operates entirely on the client-side, requiring no backend or external dependencies.

## 🛠 JavaScript Tools & Techniques Used

This project leverages modern ES6+ Vanilla JavaScript to interact with the DOM and handle data processing. Below are the core native APIs and techniques implemented:

### 1. IIFE (Immediately Invoked Function Expression)
The entire script is wrapped in an IIFE. This ensures absolute scope isolation, preventing variable collisions with the host page's native scripts.
```javascript
(function(w, d) {
    // Isolated scope for scraper and UI logic
})(window, document);
```

### 2. Dynamic DOM Manipulation
Uses `document.createElement()` and `appendChild()` to inject a custom cyberpunk-themed floating UI panel and custom `<style>` tags directly into the host document's head and body.
```javascript
const style = d.createElement('style');
style.id = 'tmx-pro-max-styles';
style.innerHTML = `/* CSS rules */`;
d.head.appendChild(style);

const pnl = d.createElement('div');
pnl.id = 'tmx-cluster-pnl';
pnl.innerHTML = `<!-- HTML structure -->`;
d.body.appendChild(pnl);
```

### 3. DOM Traversal & NodeList Iteration
Relies on `document.querySelectorAll()` to capture the grid of products. It maps through the NodeList using `.forEach()` to systematically extract child elements like titles, prices, and links.
```javascript
const cards = d.querySelectorAll('.search-card-item');

cards.forEach(card => {
    const titleEl = card.querySelector('h3') || card.querySelector('.us--titleText--WpU1HVZ');
    const title = titleEl ? titleEl.innerText.trim() : 'No title';
    // Sub-element extraction logic...
});
```

### 4. Regex & Data Parsing
Raw price strings are sanitized using Regular Expressions and converted into operable numbers via `parseFloat()`. This enables mathematical operations, such as finding the absolute maximum and minimum prices.
```javascript
const priceEl = card.querySelector('[class*="price-sale"]');
const priceStr = priceEl ? priceEl.innerText.replace(/\n/g, '').trim() : '0';

// Strip currency symbols and letters, replace comma with dot for JS math
let parsedPrice = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
```

### 5. Blob API & Virtual URLs (CSV Export)
Data export is handled entirely in-memory. The script concatenates the scraped data into a CSV string, converts it into a file using `Blob`, and generates a temporary download link via `URL.createObjectURL()`.
```javascript
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const link = d.createElement("a");

link.setAttribute("href", url);
link.setAttribute("download", "aliexpress_scraped_data.csv");
d.body.appendChild(link);
link.click();
d.body.removeChild(link);
```

### 6. Custom Drag-and-Drop Event Handling
The floating panel's draggable behavior is built from scratch using native mouse events applied to a specific handler div, calculating offset coordinates dynamically.
```javascript
let isDrag = 0, ox, oy;
const hndl = d.getElementById('tmx-drag');

hndl.onmousedown = e => { 
    isDrag = 1; 
    ox = e.clientX - pnl.offsetLeft; 
    oy = e.clientY - pnl.offsetTop; 
    hndl.style.cursor = 'grabbing'; 
};
d.onmousemove = e => { 
    if(isDrag){ 
        pnl.style.left = (e.clientX - ox) + 'px'; 
        pnl.style.top = (e.clientY - oy) + 'px'; 
        pnl.style.right = 'auto'; 
    } 
};
d.onmouseup = () => { 
    isDrag = 0; 
    hndl.style.cursor = 'grab'; 
};
```

### 7. Native Scroll API
When highlighting the cheapest item or searching for specific keywords, the script uses `scrollIntoView()` to smoothly force the browser viewport to navigate to the exact DOM element.
```javascript
minItem.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
```

### 8. CSSOM Injection for Visual Feedback
Injects dynamic CSS `@keyframes` and toggles CSS classes to trigger infinite neon blinking animations on specific DOM elements directly from JavaScript.
```css
/* Injected via JavaScript */
@keyframes tmx-blink-expensive {
    0% { box-shadow: 0 0 10px #ef4444; border-color: #ef4444; transform: scale(1); }
    50% { box-shadow: 0 0 30px #ef4444, inset 0 0 15px #ef4444; border-color: #ef4444; transform: scale(1.02); z-index: 999;}
    100% { box-shadow: 0 0 10px #ef4444; border-color: #ef4444; transform: scale(1); }
}
.tmx-expensive { animation: tmx-blink-expensive 1.5s infinite !important; border: 2px solid #ef4444 !important; border-radius: 8px;}
```
```javascript
// Triggering the animation in DOM
maxItem.element.classList.add('tmx-expensive');

// Clearing animations
p.element.classList.remove('tmx-expensive', 'tmx-cheap', 'tmx-found');
```

## 🚀 How to Run

1. Navigate to any AliExpress search results page (e.g., search for "Goku").
2. Scroll to the bottom of the page to trigger lazy-loaded elements.
3. Open the browser's Developer Tools (F12) and navigate to the **Console** tab.
4. Paste the script and hit `Enter`. 
5. The Floating Control Panel will appear in the top-right corner.
