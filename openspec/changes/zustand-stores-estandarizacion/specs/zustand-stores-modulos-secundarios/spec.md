## ADDED Requirements

### Requirement: Each secondary module has a dedicated Zustand store
Each of the seven modules (Family, Spiritual, Documents, Communications, Audit, Offerings, Pastoral) SHALL have a dedicated Zustand store file in `church-app/src/store/` following the exact same shape as the existing stores (`memberStore.js`, `eventStore.js`, etc.).

#### Scenario: Store file exists and exports a named hook
- **WHEN** the module page component mounts
- **THEN** it imports and calls the store's named hook (e.g., `useFamilyStore()`) to access state and actions

#### Scenario: Store shape matches the established pattern
- **WHEN** a store file is created
- **THEN** it exports a named `use<Module>Store` hook created with Zustand's `create((set, get) => ({...}))`
- **THEN** the store contains `loading: false`, `error: null`, and one or more data arrays as initial state

---

### Requirement: Store manages all server state for its module
Each store SHALL own all server state for its module: the fetched data arrays, loading indicator, error message, and dropdown options (tipos, estados, miembros lists).

#### Scenario: Data fetch updates store state
- **WHEN** a fetch action is called
- **THEN** `loading` is set to `true` before the request
- **THEN** on success the data array is updated with `response.data?.success ? response.data.data : []`
- **THEN** `loading` is set to `false` after the request completes

#### Scenario: Dropdown options are loaded through the store
- **WHEN** the page needs dropdown options (tipos, estados, miembros lists, etc.)
- **THEN** it calls the store's options-loading action (e.g., `fetchOpciones`)
- **THEN** the options are stored in the store state and remain available for subsequent modal opens without re-fetching

#### Scenario: Error is captured on failed request
- **WHEN** an API call throws an error
- **THEN** `error` is set to `error.message` and `loading` is set to `false`

---

### Requirement: Mutation actions return a result object
Every create, update, and delete action in each store SHALL return `{ success: boolean, message?: string }`.

#### Scenario: Successful mutation returns success true
- **WHEN** a create, update, or delete action completes successfully
- **THEN** the action returns `{ success: true }`
- **THEN** the store re-fetches or updates its local data array to reflect the change

#### Scenario: Failed mutation returns success false with message
- **WHEN** a create, update, or delete action fails (API error or `success: false` in response)
- **THEN** the action returns `{ success: false, message: "<error text from response>" }`
- **THEN** `loading` is set to `false`

---

### Requirement: Multi-entity modules use a single store
Modules with multiple sub-entities in a single page (Pastoral: visitas + peticiones; Offerings: ofrendas + presupuestos) SHALL use ONE store that manages all sub-entities.

#### Scenario: Pastoral store manages both visitas and peticiones
- **WHEN** `usePastoralStore` is consumed
- **THEN** the store exposes `visitas`, `peticiones`, `fetchVisitas`, `fetchPeticiones`, and all related create/update/delete actions for each entity

#### Scenario: Offerings store manages both ofrendas and presupuestos
- **WHEN** `useOfferingsStore` is consumed
- **THEN** the store exposes both ofrendas and presupuestos state and all related actions

---

### Requirement: Audit store is read-only
The audit store SHALL expose only fetch actions — no create, update, or delete.

#### Scenario: Audit store has no mutation actions
- **WHEN** `useAuditStore` is created
- **THEN** it only exposes fetch actions (e.g., `fetchLogs`, `fetchTablas`)
- **THEN** no create, update, or delete actions are present

---

### Requirement: Pages delegate server state to their store
Each page SHALL be refactored so that all server state (data arrays, loading, error, dropdown options) comes from its store. Local `useState` and direct `api` imports are removed for server state concerns.

#### Scenario: Page imports store instead of api for server state
- **WHEN** the refactored page component is rendered
- **THEN** it does not import `api` directly for server state
- **THEN** it calls its store hook to get data, loading state, and actions

#### Scenario: UI state remains local
- **WHEN** the page manages modal visibility, currently-edited item, or active tab
- **THEN** these remain as local `useState` in the component and are not moved to the store

#### Scenario: Page behavior is identical after refactoring
- **WHEN** the user interacts with a refactored page
- **THEN** all existing features (list, create, edit, delete, filter, opciones loading) work exactly as before
