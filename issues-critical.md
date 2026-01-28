# SolampIO Pre-Launch: Critical Issues

**Audit Date:** 2026-01-28
**Status:** Must fix before launch

---

## 1. Soft 404 Pages Return HTTP 200 [CRITICAL]

### Problem
When a user visits a non-existent URL like `/nonexistent-page/`, the site displays a "Page Not Found" message but returns HTTP 200 status code instead of 404.

### Impact
- **SEO damage**: Google may index these empty pages
- **Crawl budget waste**: Search engines will crawl invalid URLs
- **User confusion**: Bookmarked broken links appear to "work"

### Location
`src/routes/[slug]/index.tsx:758-770` - The `NotFoundPage` component

### Fix Required
Add HTTP 404 response status when `type === 'not_found'`:

```typescript
// In the routeLoader$, set status when not found:
export const usePageData = routeLoader$(async (requestEvent): Promise<PageData> => {
  // ... existing logic ...

  // 4. Not found - SET 404 STATUS
  requestEvent.status(404);
  return { type: 'not_found' };
});
```

### Verification
After fix, run:
```bash
curl -sL -o /dev/null -w "%{http_code}" "https://solampio-web.pages.dev/nonexistent-test/"
# Should return: 404
```

---

## Products Missing Images (Test Items)

### Products Without Images
These 5 products have no CF Images but are test/legacy items - acceptable for launch:

| SKU | Title |
|-----|-------|
| VIC-SS-250-85 | Blue MPPT 250 85 |
| LEGACY-ITEM | Legacy/Deleted Item Placeholder |
| PD-V01 | Protocol-D V01 |
| test-item-16 | test-item-16a |
| test-item-17 | test-item-17-abc123 |

**Recommendation:** Hide or delete these test items in ERPNext (set `is_visible = 0`)

---

## Go-Live Gating

| Issue | Severity | Blocks Launch? |
|-------|----------|----------------|
| Soft 404 pages | CRITICAL | YES |
| Test products visible | LOW | NO |

**Action:** Fix soft 404 issue, then proceed with launch.
