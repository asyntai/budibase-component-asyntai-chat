<script>
  import { getContext, onMount, onDestroy } from "svelte"
  import {
    cleanWidgetId,
    buildUserContext,
    mountWidget,
    hideWidget,
    panelUrl,
    panelHeight,
  } from "./loader.js"

  export let widgetId
  export let mode = "panel"
  export let height = 650
  export let shareUser = true
  export let context

  const { styleable, builderStore, authStore } = getContext("sdk")
  const component = getContext("component")

  $: id = cleanWidgetId(widgetId)
  $: bubble = mode === "bubble"
  $: user = shareUser ? $authStore : null
  $: userContext = buildUserContext(user, context)

  let mounted = false
  let shownId = ""
  onMount(() => {
    mounted = true
  })

  // Runs again when the settings change in the builder.
  $: if (mounted && bubble && id) {
    mountWidget(document, window, { widgetId: id, userContext })
    shownId = id
  }
  $: if (mounted && !bubble && shownId) {
    hideWidget(document, shownId)
    shownId = ""
  }

  onDestroy(() => {
    if (shownId) hideWidget(document, shownId)
  })
</script>

{#if !bubble && id}
  <div class="asyntai-panel" use:styleable={$component.styles}>
    <iframe
      title="Asyntai AI Chat"
      src={panelUrl(id)}
      style="height: {panelHeight(height)}px"
      allow="clipboard-write"
    ></iframe>
  </div>
{:else if $builderStore.inBuilder}
  <div class="asyntai-placeholder" use:styleable={$component.styles}>
    <strong>Asyntai AI Chat</strong>
    {#if id}
      <span>The chat button shows in the corner of this screen.</span>
    {:else if widgetId}
      <span>This Widget ID is not valid. Copy it from the Install page in Asyntai.</span>
    {:else}
      <span>Add your Widget ID in the settings panel.</span>
    {/if}
  </div>
{/if}

<style>
  .asyntai-panel {
    width: 100%;
  }
  .asyntai-panel iframe {
    display: block;
    width: 100%;
    min-width: 320px;
    border: none;
    border-radius: 12px;
  }
  .asyntai-placeholder {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 16px;
    border: 1px dashed var(--spectrum-global-color-gray-400, #bbb);
    border-radius: 6px;
    font-size: 13px;
    color: var(--spectrum-global-color-gray-800, #333);
  }
</style>
