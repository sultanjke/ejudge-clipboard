# ejudge.kz - copy/paste disabler bypasser

Restores copy, cut, paste, the context menu, and related shortcuts in the Monaco
code editor on `https://ejudge.kz/new-client` pages.

A **userscript** is a small JavaScript program that a browser extension runs on
matching websites. **Tampermonkey** is the extension that installs and runs this
script for you.

## What you need

- Google Chrome, or a compatible Chromium-based browser.
- **Regular Tampermonkey (stable)**. The beta version is not required.
- The [`ejudge-clipboard.user.js`](ejudge-clipboard.user.js) file from this project.
- Access to an ejudge.kz problem page with a solution editor.

## Installation, step by step

### 1. Install Tampermonkey

If you already have regular Tampermonkey installed, skip to step 2.

1. Open [the official Tampermonkey website](https://www.tampermonkey.net/) in Chrome.
2. Choose the stable Chrome/Chromium version and follow its link to the extension
   store.
3. Click **Add to Chrome** (the store may use that wording even in Helium), then
   confirm **Add extension** when prompted.
4. Find the browser's **Extensions** button, usually a puzzle-piece icon near the
   top-right corner. Open it and find **Tampermonkey**.
5. If a pin button is available, pin Tampermonkey so its icon is easy to find.

### 2. Allow Tampermonkey to run userscripts

The available settings depend on your browser version.

1. Type `chrome://extensions` into the browser's **address bar** and press **Enter**.
   The browser may redirect it to its own equivalent settings address.
2. Find **Tampermonkey** and make sure its extension switch is **on**.
3. Click **Details**.
4. If you see **Allow User Scripts**, turn it **on**.
   - If that option is missing and Tampermonkey asks you to enable **Developer
     mode**, go back to the extensions list and turn on **Developer mode**, usually
     in the top-right corner.
5. Under **Site access**, ensure Tampermonkey can run on `https://ejudge.kz`.
   If you use **On specific sites**, add that address. Access **On all sites** also
   covers it. Access only **On click** may prevent the early injection this script needs.

If Tampermonkey displays a setup message, complete those steps before continuing.

### 3. Copy the script file

1. Locate **`ejudge-clipboard.user.js`** in the project folder.
   - If the project came in a ZIP archive, right-click the ZIP and choose
     **Extract All** first, then open the extracted folder.
2. Right-click the file and choose **Open with → Notepad** (or another text editor).
   Use **Open with** rather than double-clicking a `.js` file, which Windows may
   try to execute instead of displaying its contents.
3. In the text editor, press **Ctrl+A** to select everything, then **Ctrl+C** to copy.

Copy the **entire file**, including its header beginning with:

```js
// ==UserScript==
```

If viewing the file on a code-hosting website, open its **Raw** view first and copy
the full file contents. Copy only the JavaScript, without line numbers or Markdown
code fences such as ` ```js `.

### 4. Add the script to Tampermonkey

1. Return to your browser and click the **Tampermonkey** toolbar icon.
2. Click **Create a new script**. Alternatively, open **Dashboard** and click the
   **+** tab to create a script.
3. An editor opens with example code. Click **inside the code area**.
4. Press **Ctrl+A** to select all the example code, then **Ctrl+V** to replace it
   with the script you copied.
5. Press **Ctrl+S** to save. You can also use the editor's **File → Save** menu.
6. Open Tampermonkey's **Dashboard** and find:

   **ejudge.kz — copy/paste disabler bypasser**

7. Make sure the switch next to that script is **on**. Also make sure Tampermonkey itself is enabled in its toolbar menu.

### 5. Reload the solution page

1. Open ejudge.kz/contest page, log in as usual, and navigate to a code editor.
2. Press **Ctrl+R** or click the browser's **Reload** button.

**Reloading is required.** The script needs to run before the website sets up the
editor. Installing it while the page is open does not repair that existing editor
until the page reloads.

A successful initialization should show:

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
