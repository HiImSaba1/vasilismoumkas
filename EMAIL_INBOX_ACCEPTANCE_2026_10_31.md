# Real inbox acceptance — owner-run

Authorized Gmail test destination: **paulsaba1710@gmail.com**. This is a test recipient, not a replacement for the studio's sender/internal notification addresses. No real test email was sent by the agent.

1. Reload the local designer after the envelope fix. Reopen test 010. It must show sections/photo/text, not `VM_EMAIL_V1` or JSON. A saved CRLF or an otherwise empty double wrapper is now decoded. A nested wrapper with extra edits is blocked rather than discarding those edits.
2. Review desktop/mobile. The original logo and both social PNGs are embedded as CID MIME images, so local test delivery no longer depends on their production URLs. Portfolio photographs still need their normal public HTTPS URLs. Save 010 if it has never been saved. Use **Send a test of this design** and enter the authorized Gmail address above. It uses current unsaved design fields and sample customer details, with a TEST subject. Sample proposal links intentionally use example.invalid.
3. In Gmail verify actual received layout, all photos, original 350px signature, website button then phone/email row then social row; compare light and dark mode. Off-white image/body/logo panels now have explicit bgcolor/CSS and light color-scheme hints. A mail client may still force color inversion; screenshot acceptance is required.
4. Disable images: confirm meaningful alt descriptions and readable text/contact links. Open the actual website, gallery and social links. Do not expect sample offer links to open a real customer offer.
5. Repeat 001 for wedding and baptism; check personalized salutation, real event date, venue, optional gallery/video sections and connected offer on a designated test record. Never email a real customer merely to verify styling.
6. Repeat short 002/003 (main photo off), and inspect the saved delivery HTML/text snapshot. Confirm test sends have no customer/offer association and no follow-up jobs or sent-offer transition.
7. Apple Mail is a separate acceptance gate. A Gmail inbox screenshot does not prove Apple Mail compatibility. The same mailbox can be opened in Apple Mail if already configured by the owner; otherwise the owner must provide an appropriate test destination and inspect it.
8. After approving inbox tests, apply the common style to each event/language collection via the explicit collection-style action. This keeps message copy, saved photos, active status and automation timings; 010 is excluded. Check the target collection list and save current edits first.

No Git push, production activation or automatic bulk template write has been executed. Use the full verification script before the release process.
