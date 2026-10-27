## Why

Seven modules (Pastoral, Offerings, Spiritual, Communications, Documents, Family, Audit) manage server state with local `useState` and direct `api` calls, while the rest of the application uses Zustand stores. This creates an inconsistent pattern that makes the codebase harder to maintain and extend.

## What Changes

- **New**: `familyStore.js` — Zustand store for family relationships module
- **New**: `spiritualStore.js` — Zustand store for spiritual records module
- **New**: `documentStore.js` — Zustand store for documents module
- **New**: `communicationsStore.js` — Zustand store for communications module
- **New**: `auditStore.js` — Zustand store for audit log module (read-only)
- **New**: `offeringsStore.js` — Zustand store for offerings and budgets module
- **New**: `pastoralStore.js` — Zustand store for pastoral visits and prayer requests module
- **Modified**: `Family.jsx` — refactored to consume `useFamilyStore`
- **Modified**: `Spiritual.jsx` — refactored to consume `useSpiritualStore`
- **Modified**: `Documents.jsx` — refactored to consume `useDocumentStore`
- **Modified**: `Communications.jsx` — refactored to consume `useCommunicationsStore`
- **Modified**: `Audit.jsx` — refactored to consume `useAuditStore`
- **Modified**: `Offerings.jsx` — refactored to consume `useOfferingsStore`
- **Modified**: `Pastoral.jsx` — refactored to consume `usePastoralStore`

## Capabilities

### New Capabilities

- `zustand-stores-modulos-secundarios`: Zustand stores for the seven secondary modules (Family, Spiritual, Documents, Communications, Audit, Offerings, Pastoral), each following the same shape as existing stores (memberStore, eventStore, etc.)

### Modified Capabilities

## Impact

- `church-app/src/store/` — 7 new store files
- `church-app/src/pages/Family.jsx`, `Spiritual.jsx`, `Documents.jsx`, `Communications.jsx`, `Audit.jsx`, `Offerings.jsx`, `Pastoral.jsx` — api imports removed, local server-state replaced by store hooks
- No backend changes. No routing changes. No new dependencies.
