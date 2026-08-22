---
id: 20260821-150731-public-auth-split-portal-ui
title: Public Auth Portal Split-Screen Redesign
archived_at: 2026-08-21
status: active
references: []
affected_modules:
  - app/(public)/auth
  - app/(public)/login
  - app/(public)/register
  - app/(public)/forget-password
---

# Archive: Public Auth Portal Split-Screen Redesign

## 1. Problem & Core Value
- **Problem**: Public authentication views (`/login`, `/register`, `/forget-password`) were constrained in a single, narrow vertical column layout without strong brand identity or high-tech visual engagement.
- **Value**: Modernized public auth into a responsive 12-column split-screen layout featuring a 3D futuristic operations hub hero banner on desktop and Ant Design component architecture.

## 2. Key Architecture & Decisions
- **Split-Screen Grid**: Uses `<CustomRow>` and `<CustomCol>` (`lg={13}` hero visual, `lg={11}` form card) with graceful mobile collapse.
- **Ant Design Primitives**: Replaced ad-hoc HTML/Tailwind wrappers with `<CustomFlex>`, `<CustomSpace>`, `<CustomTag>`, `<CustomTypography>`, `<CustomCard>`, and `<CustomButton>`.
- **Lightweight Asset Integration**: Leveraged a single high-resolution hero visual asset with gradient overlays rather than heavy client-side canvas animations.

```mermaid
flowchart TD
    PublicLayout[PublicLayout / MainProvider] --> AuthLayout[AuthLayout Split Grid]
    AuthLayout -->|lg=13 Left Column| HeroBanner[AuthHeroBanner 3D Hub Visual & Value Prop]
    AuthLayout -->|lg=11 Right Column| AuthCard[AuthCard Glassmorphic Container]
    AuthCard --> Form[LoginForm / RegisterForm / ForgetPasswordForm]
    AuthCard --> Social[AuthSocialLogin Google OAuth]
```

## 3. Scope & Key Changes
- [`public/images/auth-banner.jpg`](file:///d:/Sources/Personal/only-one-fe/public/images/auth-banner.jpg): 3D infinity hub brand visual.
- [`src/app/(public)/_components/auth/AuthHeroBanner.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/_components/auth/AuthHeroBanner.tsx): Left-column hero banner with dynamic typography and branding tags.
- [`src/app/(public)/_components/auth/AuthLayout.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/_components/auth/AuthLayout.tsx): Responsive split-screen container.
- [`src/app/(public)/_components/auth/AuthCard.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/_components/auth/AuthCard.tsx): Standardized card wrapper using `<CustomCard>`.
- [`src/app/(public)/_components/auth/AuthSocialLogin.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/_components/auth/AuthSocialLogin.tsx): Updated social login buttons.
- [`src/app/(public)/login/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/login/page.tsx), [`register/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/register/page.tsx), [`forget-password/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(public)/forget-password/page.tsx): Updated public routes.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed (`npm run lint:fix`, `npm run build` static generation clean).
- **PR URL**: ~
