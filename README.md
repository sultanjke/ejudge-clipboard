# ejudge.kz clipboard extension

Restores copy, cut, paste, the context menu, and related shortcuts in the Monaco
code editor on `https://ejudge.kz/new-client` pages.

## What you need

- Google Chrome, or a compatible Chromium-based browser.
- Regular Tampermonkey (stable).
- The [`ejudge-clipboard.user.js`](ejudge-clipboard.user.js) file from this project.

## Installation, step by step

https://github.com/user-attachments/assets/13cc8c67-27d2-453e-9126-b2bcf5596cbd

### 1. Install Tampermonkey

1. Open [the official Tampermonkey website](https://www.tampermonkey.net/) in Chrome.
2. Click **Add to Chrome**, then
   confirm **Add extension** when prompted.
3. If a pin button is available, pin Tampermonkey so its icon is easy to find.

### 2. Allow Tampermonkey to run userscripts

1. Type `chrome://extensions` into the browser's **address bar** and press **Enter**.
   The browser may redirect it to its own equivalent settings address.
2. Find **Tampermonkey** and make sure its extension switch is **on**.
3. Click **Details**.
4. If you see **Allow User Scripts**, turn it **on**.

### 3. Drag and drop the downloaded .user.js file
1. Download [`ejudge-clipboard.user.js`](ejudge-clipboard.user.js).
2. Click the Tampermonkey icon → Dashboard.
3. Drag the ejudge-clipboard.user.js from File Explorer or from Chromium's recent downloaded history into the Dashboard page.
4. Tampermonkey should open an installation screen. Click **Install**.

### 4. Reload the code editor page

1. Open ejudge.kz/contest page, log in as usual, and navigate to a code editor.
2. Press **Ctrl+R** or click the browser's **Reload** button.

**Reloading is required.** The script needs to run before the website sets up the
editor. Installing it while the page is open does not repair that existing editor
until the page reloads.

A successful initialization should show in Console DevTools **(F12)**:

```text
[ejudge clipboard] Early hooks installed.
[ejudge clipboard] Clipboard restrictions intercepted for editor 1
```

You can also test:

| Action | Windows shortcut or control |
| --- | --- |
| Copy selected code | **Ctrl+C** |
| Cut selected code | **Ctrl+X** |
| Paste | **Ctrl+V** |
| Undo | **Ctrl+Z** |
| Open the editor's context menu | Right-click inside the editor |

## Disabling or uninstalling

- **Temporarily disable:** Open Tampermonkey's Dashboard and turn off the switch
  next to this script, then reload the ejudge.kz page.
- **Uninstall:** Use the script's delete/trash action in the Dashboard and confirm,
  then reload the page.

## Disclaimer

This project been developed only under the educational and research purposes (sec. research & PoC). Use wisely.

**You are responsible for your use of this script. To the extent permitted by
applicable law, the author accepts no responsibility or liability for consequences
arising from its use or misuse, including account blocking, suspension or bans,
contest disqualification, academic penalties, data loss, or other damages.**
