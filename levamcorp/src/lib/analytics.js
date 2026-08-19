// ── LEVAM CORP · ANALYTICS TRACKER ───────────────────────────────────────────
// Call these functions anywhere in the portal to track client behavior

import { createClient } from './supabase'

async function track(eventType, data = {}) {
  try {
    const sb   = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return  // only track logged-in clients

    await sb.from('analytics_events').insert([{
      event_type:    eventType,
      client_id:     user.id,
      client_email:  user.email,
      client_name:   user.user_metadata?.full_name || user.email,
      page:          typeof window !== 'undefined' ? window.location.pathname : null,
      ...data,
    }])
  } catch (e) {
    // Fail silently — never break the user experience
  }
}

// ── EVENT TYPES ───────────────────────────────────────────────────────────────

// Track when client loads a portal page
export const trackPageView = (page) =>
  track('page_view', { page })

// Track when client views a product detail
export const trackProductView = (product) =>
  track('product_view', {
    product_id:    product.id,
    product_name:  product.name,
    product_brand: product.brand,
    metadata:      { price: product.price, sku: product.sku },
  })

// Track when client clicks "Add to order" or "Request quote"
export const trackProductClick = (product, action) =>
  track('product_click', {
    product_id:    product.id,
    product_name:  product.name,
    product_brand: product.brand,
    metadata:      { action, price: product.price },
  })

// Track catalog search
export const trackSearch = (query, resultsCount) =>
  track('catalog_search', {
    metadata: { query, results_count: resultsCount },
  })

// Track when client starts an order
export const trackOrderStarted = (items) =>
  track('order_started', {
    metadata: { items_count: items.length, total: items.reduce((s, i) => s + (i.price * i.qty), 0) },
  })
