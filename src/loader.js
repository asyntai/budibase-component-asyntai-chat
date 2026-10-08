// Loads the Asyntai chat widget into a Budibase app page. Kept free of Svelte
// so the same code runs in the plugin and in the unit tests.

export const WIDGET_SRC = "https://widget.asyntai.com/static/js/chat-widget.js"
export const PANEL_BASE = "https://asyntai.com/app-chat/"
export const PANEL_HEIGHT = 650

// Widget IDs are short tokens like "asyntai_ab12cd34". Anything else is a
// typo or a pasted snippet, and must never reach a script attribute.
const WIDGET_ID = /^[A-Za-z0-9_-]{4,64}$/

export function cleanWidgetId(value) {
  const id = String(value == null ? "" : value).trim()
  return WIDGET_ID.test(id) ? id : ""
}

// The chat page for the panel mode. Budibase allows any https frame, so the
// panel works without changing the app's Content Security Policy.
export function panelUrl(widgetId) {
  const id = cleanWidgetId(widgetId)
  return id ? `${PANEL_BASE}${id}/` : ""
}

export function panelHeight(value) {
  const height = Number(value)
  if (!Number.isFinite(height) || height <= 0) return PANEL_HEIGHT
  return Math.min(Math.max(Math.round(height), 320), 2000)
}

// The agent reads window.Asyntai.userContext as key/value lines. Only fields
// that hold a value are sent.
export function buildUserContext(user, extra) {
  const context = {}
  if (user) {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    if (name) context.name = name
    if (user.email) context.email = String(user.email)
    if (user.roleId) context.appRole = String(user.roleId)
  }
  const note = String(extra == null ? "" : extra).trim()
  if (note) context.notes = note
  return Object.keys(context).length ? context : null
}

function hostOf(doc, id) {
  return doc.getElementById(`asyntai-widget-host-${id}`)
}

// Adds the widget once per page. Budibase swaps screens without a page load,
// so a second mount of the same widget only shows it again.
export function mountWidget(doc, win, { widgetId, userContext }) {
  const id = cleanWidgetId(widgetId)
  if (!id) return false

  win.Asyntai = win.Asyntai || {}
  if (userContext) {
    win.Asyntai.userContext = userContext
  } else {
    delete win.Asyntai.userContext
  }

  const host = hostOf(doc, id)
  if (host) host.style.display = "block"

  const loaded = Array.from(doc.querySelectorAll("script[data-asyntai-id]")).some(
    script => script.getAttribute("data-asyntai-id") === id
  )
  if (!loaded) {
    const script = doc.createElement("script")
    script.src = WIDGET_SRC
    script.async = true
    script.setAttribute("data-asyntai-id", id)
    doc.body.appendChild(script)
  }
  return true
}

// Leaving the screen hides the chat. The conversation stays, so it is there
// again when the user comes back.
export function hideWidget(doc, widgetId) {
  const id = cleanWidgetId(widgetId)
  if (!id) return
  const host = hostOf(doc, id)
  if (host) host.style.display = "none"
}
