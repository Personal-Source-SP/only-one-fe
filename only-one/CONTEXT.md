# Domain Glossary & Architecture Context

## Scraping Discovery Module

### Core Domain Entities & Concepts
- **DiscoverySession**: A job session record targeting a specific `dataProviderId` and `targetUrl` with `depth` and `maxUrls`.
  - **Key Metrics**: `totalDiscovered`, `totalValidated`, `totalQueued`, `durationSeconds`.
  - **Status Lifecycle**: `pending`, `in_progress`, `completed`, `failed`.
- **DiscoveryUrl**: A hyperlink extracted during a session.
  - **Attributes**: `url`, `domain`, `title`, `foundAtDepth`, `confidenceScore`, `priceDetected`, `detectedPrice`, `detectedCurrency`.
  - **Status Lifecycle**: `discovered`, `queued`, `scraped`, `failed`.
  - **Validation Lifecycle**: `pending`, `processing`, `completed`, `failed`, `skipped`.
  - **Review Status**: `pending_review`, `approved`, `rejected`.
- **Batch Enqueue**: The operation converting discovered URLs into active scraping queue records (`ScrapingData`).
- **Validation Batch**: An asynchronous or instant evaluation batch scoring URLs using deterministic heuristics.
