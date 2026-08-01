# Click No. 004 hotfix

Replace the matching files in the Nice Little Click Lab repository, then run:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Fixes:
- Defers session-storage hydration to a timer callback so React's `set-state-in-effect` rule is satisfied.
- Removes the unsupported `characterSpacing` option from `pdf-lib`'s `drawText` call.
