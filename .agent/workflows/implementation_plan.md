---
description: Implementation Plan for Extended Pilate Studio Features
---

## Phase 1: Core Business Logic (Booking & Notification)
- [ ] **Advanced Booking Action**:
    - [ ] Create `src/app/actions/booking.ts`.
    - [ ] Implement `bookClass` function:
        - Check user credits.
        - Check class capacity.
        - If full, add to Waitlist (and return status).
        - If space, deduct credit, create Booking, create Transaction (log usage).
    - [ ] Implement `cancelBooking` function:
        - Check 12h cancellation window.
        - If late cancel, do NOT refund credit (burn it).
        - If early cancel, refund credit.
        - If spot opens, auto-move first waitlist user to confirmed? (Or notify them). *Decision: Notify for MVP*.
- [ ] **Notification System**:
    - [ ] Install `nodemailer`.
    - [ ] Create `src/lib/mail.ts` helper.
    - [ ] Integrate email sending into `bookClass` and `cancelBooking`.

## Phase 2: User Experience (Profile & Health)
- [ ] **Profile Page**:
    - [ ] Create `src/app/dashboard/profile/page.tsx`.
    - [ ] Form for Name, Phone, Avatar.
    - [ ] Tab for Change Password.
    - [ ] Tab for Health Profile (Injury history, Par-Q form).
    - [ ] Action: `updateProfile` and `updateHealthProfile`.

## Phase 3: Admin & Trainer Management
- [ ] **Reports Page**:
    - [ ] Create `src/app/dashboard/reports/page.tsx`.
    - [ ] Calculate Monthly Revenue (sum of Transactions type INCOME).
    - [ ] Best selling packages (Group by packageId count).
- [ ] **Trainer Panel**:
    - [ ] Availability Calendar (`src/app/dashboard/availability/page.tsx`).
    - [ ] Payroll view (Count of classes taught * rate).

## Phase 4: Content (Blog & Video)
- [ ] **Blog**:
    - [ ] `src/app/blog/page.tsx` (Public list).
    - [ ] `src/app/blog/[slug]/page.tsx` (Detail).
    - [ ] Admin editor for posts.
- [ ] **Videos**:
    - [ ] `src/app/dashboard/videos/page.tsx` (Protected).
    - [ ] List Youtube/Vimeo embed links from DB.
