---
id: 20260820-213600-refactor-data-provider-features-ui
title: Refactor Data Provider List and Enhance Feature Settings Dropdown UI
archived_at: 2026-08-21
status: active
references:
  - only-one/archives/20260820-204100-data-provider-features-page.md
  - only-one/archives/20260820-210000-decompose-interfaces-to-pages.md
affected_modules:
  - scraping/data-providers
  - scraping/features
---

# Archive: Refactor Data Provider List and Enhance Feature Settings Dropdown UI

## 1. Problem & Core Value
- **Problem**: The Data Provider list table was cluttered with 4 obsolete feature columns and redundant modal triggers, while adding a new feature configuration on the features page required a clunky 2-step create-then-configure flow.
- **Value**: Streamlined the Data Provider table down to core identity fields, and upgraded the Features dashboard with a 1-step dropdown action ("Thêm cài đặt") supporting instant draft configuration with automatic creation on submit.

## 2. Key Architecture & Decisions
- **Streamlined Provider Table**: Cleaned up legacy action buttons and removed obsolete modal components (`DataProviderSettingModal`, `DataProviderTargetModal`, etc.).
- **1-Step Feature Configuration**: Integrated draft mode into `DataProviderFeatureSettingModal` where submitting automatically issues `POST` for unpersisted features and `PUT` for existing ones.
- **Dropdown & Placeholder Triggers**: "Thêm cài đặt" dropdown and placeholder card click directly open the draft form for unconfigured feature types.

```mermaid
flowchart TD
    User([User]) -->|Clicks Thêm cài đặt / Placeholder| Hook[openConfigByType]
    Hook --> Modal[DataProviderFeatureSettingModal - Draft Mode]
    Modal --> Form[Scraping/Search Config Form]
    Form -->|Submit| Decision{Feature exists?}
    Decision -->|No| POST[POST data-provider-features]
    Decision -->|Yes| PUT[PUT data-provider-features/:id]
```

## 3. Scope & Key Changes
- [`src/app/(root)/scraping/data-providers/`](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers): Cleaned table columns, deleted 4 legacy modal files, and pruned state handlers.
- [`src/app/(root)/scraping/features/[dataProviderId]/`](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]): Added "Thêm cài đặt" dropdown, removed `CreateFeatureModal.tsx`, and updated `ScrapingConfigForm.tsx` / `SearchConfigForm.tsx` with unified draft submit logic.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed (Production build `next build` compiled with exit code 0).
- **PR URL**: ~
