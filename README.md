# Asyntai AI Chat for Budibase

Put an AI agent on any Budibase screen. Your team asks a question and the [Asyntai](https://asyntai.com) agent answers from your own knowledge: policies, product details, help articles, price lists.

## Display

- **Chat panel on the screen**: the chat sits in the screen at the height you choose. Works in every Budibase app with no extra setup.
- **Chat button in the corner**: a floating chat button, like on your website. The agent knows who is signed in (name, email address, app role) and any extra context you add.

## Install

1. In Budibase open **Settings**, **Plugins**, **Add plugin**.
2. Choose **GitHub** and paste `https://github.com/asyntai/budibase-component-asyntai-chat`.
3. Open a screen, press **Add component**, choose **Asyntai AI Chat**.
4. Paste your Widget ID from the Asyntai **Install** page (it starts with `asyntai_`).

The chat button loads a script from `widget.asyntai.com`. On a self-hosted Budibase, allow it with:

```
CUSTOM_CSP_SCRIPT_SRC=https://widget.asyntai.com
CUSTOM_CSP_CONNECT_SRC=https://asyntai.com,https://widget.asyntai.com
```

Full guide: https://asyntai.com/documentation/integrations/budibase/

## Build

```bash
npm install --legacy-peer-deps
npm test
npm run build
```

Svelte is pinned to the version Budibase ships (5.40.2). A newer compiler emits runtime calls the Budibase client does not have.

## Support

hello@asyntai.com

## Licence

MIT
