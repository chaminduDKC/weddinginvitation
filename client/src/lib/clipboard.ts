/**
 * Universal cross-platform clipboard copy utility.
 * Reliably copies text on:
 * - Desktop browsers (Chrome, Safari, Firefox, Edge)
 * - Mobile Safari (iOS) and Android Chrome
 * - Mobile In-App Browsers (WhatsApp, Facebook, Instagram WebViews)
 * - Local development networks / HTTP contexts (where navigator.clipboard is blocked)
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Strategy 1: Modern async Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Permission denied or blocked in WebView, fall through to Strategy 2
      console.warn('Async clipboard writeText blocked, trying execCommand fallback:', err);
    }
  }

  // Strategy 2: Invisible textarea with execCommand('copy') optimized for mobile WebKit & Blink
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Prevent mobile keyboard from opening and avoid page jumping/scrolling
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-1';
    textArea.style.fontSize = '16px'; // Prevents auto-zoom on iOS Safari

    document.body.appendChild(textArea);

    // iOS WebKit selection handling
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
      textArea.setSelectionRange(0, 999999);
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};
