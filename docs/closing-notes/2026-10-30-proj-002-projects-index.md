# The projects page now lists every project and lets visitors filter them

**Status:** Ready for review
**Date:** 2026-10-30 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [PROJ-002](https://github.com/eng-rodriguez/personal-website/issues/11) · [Story](../stories/proj-002-projects-index.md) · [Brief](../briefs/proj-002-projects-index.md) · [PR](pending)

## What we delivered
The projects page shows each published project as a card with its summary, status and technologies. Visitors can narrow the list by status and by technology. The filters run in the browser with no server, and the page announces how many projects match. Without JavaScript the full list still shows. No projects are published yet, so today the page still says "No projects yet".

## Why it matters
Visitors find relevant work quickly, and the owner updates the page just by publishing a project.

## How we know it works
- All 708 unit tests, all 53 browser tests and the full style, type and build check passed.
- With sample projects added temporarily, all 53 browser tests passed again. They covered filtering, keyboard use, small screens and the page without JavaScript, and hidden drafts never appeared.
- Three independent reviews (requirements, design and security) found no critical or important issues. They reported ten minor notes, all left as they are.
- Zoom, screen reader, high-contrast, print and back-button checks are left for the owner.

## Not included / deferred
- Individual project pages, so cards are not links yet.
- Repository and live-site links, shareable filtered links, multiple selections, search and sorting.

## Risks and decisions
- Status serves as the category, so the project format is unchanged.
- Going back to the page may restore the last filter. The owner accepted this.
- No new open-source building blocks were added.

## What's next
- Individual project pages, then turn the cards into links.
