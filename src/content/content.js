/**
 * Ridifilter Content Script
 *
 * This script filters books by walking through the DOM, finding text nodes that match
 * a publisher filter, and then hiding the closest parent container.
 * This is a very robust method, independent of class names or element types.
 */

// --- Globals ---

let publisherFilters = [];
let domUpdateTimeout;

// --- Core Logic ---

/**
 * Applies the filter by finding text nodes and hiding their parent book containers.
 */
function applyDomFilter() {
  // 1. Reset any previously hidden elements by this script.
  document.querySelectorAll('[data-ridifilter-hidden]').forEach(card => {
    card.style.display = ''; // Revert display to default
    card.removeAttribute('data-ridifilter-hidden');
  });

  if (publisherFilters.length === 0) {
    return;
  }

  // 2. Define the selectors for what constitutes a "book card" container.
  const bookCardSelectors = [
    '.book_macro_110',
    'div[role="listitem"]',
    '.rs-list-item-wrapper',
    'li.search_result_item',
    'li' // General fallback
  ].join(', ');

  // 3. Keep track of cards we've already hidden to avoid redundant work.
  const hiddenCards = new Set();

  // 4. Use a TreeWalker to efficiently find all text nodes in the document.
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  // 5. Iterate through each filter.
  publisherFilters.forEach(filter => {
    if (!filter) return; // Skip empty filters.

    // Rewind the TreeWalker for each filter.
    treeWalker.currentNode = document.body;

    let textNode;
    while (textNode = treeWalker.nextNode()) {
      // 6. If the text content includes the filter string...
      if (textNode.nodeValue.includes(filter)) {
        // 7. ...find the closest parent element that is a book card.
        const parentCard = textNode.parentElement.closest(bookCardSelectors);

        // 8. If we find a card and haven't already hidden it, hide it.
        if (parentCard && !hiddenCards.has(parentCard)) {
          parentCard.style.display = 'none'; // Hide the card
          parentCard.setAttribute('data-ridifilter-hidden', 'true');
          hiddenCards.add(parentCard);
        }
      }
    }
  });
}


// --- Event Listeners & Initialization ---

/**
 * Initializes the content script.
 */
function initialize() {
  if (!chrome.storage || !chrome.storage.sync) {
    console.error("RidiFilter: Chrome storage is not available.");
    return;
  }

  // 1. Fetch initial filters from storage and apply them.
  chrome.storage.sync.get(['publisherFilters'], (result) => {
    publisherFilters = result.publisherFilters || [];
    applyDomFilter();
  });

  // 2. Listen for changes in storage (e.g., user adds a filter in the popup).
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.publisherFilters) {
      publisherFilters = changes.publisherFilters.newValue || [];
      applyDomFilter();
    }
  });

  // 3. Use a MutationObserver to re-apply the filter when the DOM changes (e.g., infinite scroll).
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        clearTimeout(domUpdateTimeout);
        domUpdateTimeout = setTimeout(applyDomFilter, 150);
        return;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// --- Script Execution ---

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
