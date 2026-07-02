# TODO — Debug + Modernize floorplan3d

## Step 1: Backend hardening
- [x] Update `backend/app/main.py` with better error handling + request IDs
- [x] Make CORS configurable via env var (fallback to dev)
- [x] Add robust response shape validation (`walls`, `labels` always present)

## Step 2: OCR integration + config

- [x] Update `backend/app/cv_engine.py` to call `extract_room_labels` optionally
- [x] Make OCR fast/optional via query param (`ocr=1/0`) or env default
- [x] Make Tesseract path env-driven (remove hard-coded Windows path)



## Step 3: CV output improvements
- [ ] Improve wall deduping/merging and return metadata (image size/scale)

## Step 4: Frontend correctness fixes
- [x] Fix axios error logging (`print` -> `console.error`)

- [ ] Prevent stale state updates: use functional `setWalls(prev => ...)`
- [ ] Add click mode (replace vs add) + dedupe on click

## Step 5: Labels UI (2D + 3D)
- [ ] Render OCR labels in Canvas2D as overlays or side panel
- [ ] Render label markers in Viewer3D

## Step 6: Modern/unique UI polish
- [ ] Add more holographic/modern styling and consistent design tokens
- [ ] Improve loading/error UX

## Step 7: Performance
- [ ] Memoize 3D wall components / reduce rerenders
- [ ] Optimize rerender triggers

## Step 8: Verification
- [ ] Run backend + frontend dev servers
- [ ] Upload image -> click detect -> walls update correctly
- [ ] Toggle OCR -> labels appear
- [ ] Validate CORS + API connectivity

