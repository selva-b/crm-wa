```markdown
# Design System Strategy: Midnight Ember

## 1. Overview & Creative North Star
**The Creative North Star: "The Architectural Ledger"**

This design system is not a mere utility; it is a premium environment designed for high-stakes decision-making. By moving away from the "boxy" nature of traditional CRMs, we adopt an architectural aesthetic that prioritizes structural depth, tonal sophistication, and editorial clarity. 

To break the "template" look, we utilize **Intentional Asymmetry**. Key data points shouldn't always sit in a centered grid; they should feel like a curated exhibit. We achieve this by balancing massive high-contrast typography against expansive negative space. The goal is "Executive Calm"—a workspace that feels like a dimly lit, high-end corner office at midnight.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a deep, obsidian base with an amber glow that mimics the warmth of a filament bulb.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. 
- A high-priority widget (`surface-container-high`) should sit atop a `surface` background. 
- Use the `surface-container` tiers to create logical groupings. If the layout feels "flat," do not add a line; adjust the tier of the inner container.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
- **Base Layer:** `surface` (#111319) - The foundation of the application.
- **Structural Sections:** `surface-container-low` (#191b22) - Used for sidebars or large background wrappers.
- **Interactive Cards:** `surface-container` (#1e1f26) - The default for data cards.
- **Prominent Callouts:** `surface-container-highest` (#33343b) - For items requiring immediate executive focus.

### The "Glass & Gradient" Rule
To elevate the CRM from a tool to an experience:
- **Floating Elements:** Use `surface-bright` at 60% opacity with a `24px` backdrop-blur for modals and dropdowns. This creates a "frosted obsidian" effect.
- **Signature Textures:** Apply a subtle linear gradient to Primary CTAs (from `primary_container` #d97707 to `primary` #ffb77d). This adds "soul" and prevents the amber from appearing flat or plastic.

---

## 3. Typography: Editorial Authority
We use **Inter** not as a standard sans-serif, but as a tool for information hierarchy.

- **Display & Headline (The Statement):** Use `display-lg` and `headline-lg` sparingly to highlight "North Star" metrics (e.g., Total Revenue). These should feel like headers in a premium financial magazine.
- **The Contrast Play:** Pair large `headline-md` titles with `label-sm` in `on_surface_variant` (#dbc2b0). The contrast between size and weight conveys a sense of architectural planning.
- **Body Text:** Use `body-md` for standard CRM data. Ensure line-height is set to 1.6x for readability against the dark background.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are a crutch. In this system, we use light to define space.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural "recessed" effect. This mimics architectural cutouts rather than floating boxes.

### Ambient Shadows
When a floating effect is required (e.g., a "Deal Won" pop-up), use an **Ambient Shadow**:
- **Blur:** 40px - 60px.
- **Opacity:** 4% - 8%.
- **Color:** Tint the shadow with `primary` (#ffb77d) rather than black to simulate the glow of the amber elements hitting the surface.

### The "Ghost Border" Fallback
If a border is legally or accessibility-required:
- Use `outline-variant` (#554336) at **15% opacity**. 
- **Strictly Prohibited:** 100% opaque, high-contrast borders.

---

## 5. Components: Executive Refinement

### Buttons & Actions
- **Primary:** Gradient fill (`primary_container` to `primary`). 8px (`lg`) rounded corners. Text: `on_primary_container`.
- **Secondary:** Ghost style. No fill, no border. Use `label-md` weight. Subtle `surface-container-high` hover state.
- **Tertiary:** `tertiary` (#96ccff) text link for "safe" actions like "View Audit Log."

### Cards & Data Lists
- **Forbid Dividers:** Do not use lines between list items. Use 16px of vertical white space and a 2% color shift on hover (`surface-bright`).
- **Nesting:** Data within cards should use `surface-container-lowest` to create a "punched-in" look for input fields or nested tables.

### Input Fields
- **The "Underline" Aesthetic:** Instead of a four-sided box, use a `surface-container-highest` fill with a 2px bottom-only highlight in `primary` when focused. This maintains the "Architectural Ledger" feel.

### CRM-Specific Components: "The Pulse"
- **Pipeline Tracker:** Instead of a progress bar, use a series of staggered `surface-container-high` blocks that light up in `primary` amber as a deal progresses.
- **Executive Summary Chips:** Use `secondary_container` (#673d17) with `on_secondary_container` (#e4a97a) text for high-level status tags (e.g., "High Value," "At Risk").

---

## 6. Do’s and Don’ts

### Do
- **Do** use `primary` (Amber) for points of intent only. If everything is amber, nothing is important.
- **Do** lean into `surface-container-lowest` (#0c0e14) for the background of data-heavy tables to increase focus.
- **Do** use `xl` (12px) rounding for large layout containers and `lg` (8px) for internal components.

### Don’t
- **Don't** use pure white (#FFFFFF). It will cause "halation" (eye strain) against the midnight background. Use `on_surface` (#e2e2eb).
- **Don't** use standard "Success Green." Use the `tertiary` (#96ccff) blue for a more sophisticated, "Cool-Headed" executive success state.
- **Don't** crowd the interface. If a screen feels full, remove a container background rather than shrinking the text. Space is a luxury; use it.```