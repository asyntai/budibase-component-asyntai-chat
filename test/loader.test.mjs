import { test } from "node:test"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"
import { cleanWidgetId, buildUserContext, mountWidget, hideWidget, panelUrl, panelHeight, WIDGET_SRC } from "../src/loader.js"

function page() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>")
  return { doc: dom.window.document, win: dom.window }
}

function scripts(doc) {
  return Array.from(doc.querySelectorAll("script[data-asyntai-id]"))
}

test("accepts a real widget ID and trims it", () => {
  assert.equal(cleanWidgetId("  asyntai_ab12cd34 "), "asyntai_ab12cd34")
})

test("refuses a pasted snippet, a quote or an empty value", () => {
  for (const bad of ['<script src="x">', 'asyntai"onload=1', "", null, undefined, "ab", "a b c d"]) {
    assert.equal(cleanWidgetId(bad), "", String(bad))
  }
})

test("builds the user context from the signed-in user", () => {
  assert.deepEqual(buildUserContext({ firstName: "Ann", lastName: "Lee", email: "ann@example.test", roleId: "BASIC" }, ""), {
    name: "Ann Lee",
    email: "ann@example.test",
    appRole: "BASIC",
  })
})

test("adds the extra context as notes", () => {
  assert.deepEqual(buildUserContext(null, " Warehouse team "), { notes: "Warehouse team" })
})

test("sends no context when there is nothing to send", () => {
  assert.equal(buildUserContext(null, ""), null)
  assert.equal(buildUserContext({}, "  "), null)
})

test("adds the widget script once", () => {
  const { doc, win } = page()
  assert.equal(mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: null }), true)
  assert.equal(mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: null }), true)
  const found = scripts(doc)
  assert.equal(found.length, 1)
  assert.equal(found[0].src, WIDGET_SRC)
  assert.equal(found[0].getAttribute("data-asyntai-id"), "asyntai_ab12cd34")
  assert.equal(found[0].async, true)
})

test("loads from the widget host", () => {
  assert.equal(WIDGET_SRC, "https://widget.asyntai.com/static/js/chat-widget.js")
})

test("does nothing with a bad widget ID", () => {
  const { doc, win } = page()
  assert.equal(mountWidget(doc, win, { widgetId: '"><img>', userContext: null }), false)
  assert.equal(scripts(doc).length, 0)
})

test("sets and clears the user context", () => {
  const { doc, win } = page()
  win.Asyntai = { storageNamespace: "keep-me" }
  mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: { name: "Ann" } })
  assert.deepEqual(win.Asyntai.userContext, { name: "Ann" })
  assert.equal(win.Asyntai.storageNamespace, "keep-me")
  mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: null })
  assert.equal("userContext" in win.Asyntai, false)
})

test("hides the chat when the screen closes and shows it again on return", () => {
  const { doc, win } = page()
  mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: null })
  // The widget script creates this host element when it runs.
  const host = doc.createElement("div")
  host.id = "asyntai-widget-host-asyntai_ab12cd34"
  doc.documentElement.appendChild(host)
  hideWidget(doc, "asyntai_ab12cd34")
  assert.equal(host.style.display, "none")
  mountWidget(doc, win, { widgetId: "asyntai_ab12cd34", userContext: null })
  assert.equal(host.style.display, "block")
  assert.equal(scripts(doc).length, 1)
})

test("hiding before the widget exists is safe", () => {
  const { doc } = page()
  assert.doesNotThrow(() => hideWidget(doc, "asyntai_ab12cd34"))
  assert.doesNotThrow(() => hideWidget(doc, ""))
})

test("panel points at the hosted chat page with a trailing slash", () => {
  assert.equal(panelUrl(" asyntai_ab12cd34 "), "https://asyntai.com/app-chat/asyntai_ab12cd34/")
})

test("panel refuses a bad widget ID", () => {
  assert.equal(panelUrl('x" onload="1'), "")
  assert.equal(panelUrl(""), "")
})

test("panel height has a default and sane limits", () => {
  assert.equal(panelHeight(undefined), 650)
  assert.equal(panelHeight("abc"), 650)
  assert.equal(panelHeight(0), 650)
  assert.equal(panelHeight(100), 320)
  assert.equal(panelHeight(9000), 2000)
  assert.equal(panelHeight("700"), 700)
})
