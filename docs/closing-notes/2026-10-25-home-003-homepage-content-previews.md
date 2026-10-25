# The home page now previews featured projects and the latest writing

**Status:** Ready for review
**Date:** 2026-10-25 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [HOME-003](https://github.com/eng-rodriguez/personal-website/issues/8) · [Story](../stories/home-003-homepage-content-previews.md) · [Brief](../briefs/home-003-homepage-content-previews.md) · PR (to be added)

## What we delivered
Below the introduction, the home page now shows up to three projects marked as featured and the three most recent articles, each as a short card with a link to its section. The cards come straight from the written content, so publishing a project or article updates the home page with no extra work. While there is nothing to show, a section stays hidden, so today the home page looks exactly as before.

## Why it matters
Visitors see current work and writing at once instead of only an introduction, and the owner keeps one place to publish.

## How we know it works
- All 656 automated unit tests and all 46 browser tests passed, and the full style, type and build check passed.
- With sample content added temporarily, the home page showed the right items in the right order, never showed drafts, showed dates without shifting a day across time zones, fit a small phone screen and worked by keyboard and without JavaScript.
- Three independent reviews (requirements, design and security) found no critical or important issues; eight minor notes were reported.
- Zoom, high-contrast and print checks are left for the owner.

## Not included / deferred
- Professional highlights: there is no career content yet; a later ticket adds it.
- Links to individual project and article pages: those pages do not exist yet, so cards link to the section pages for now.
- No real projects or articles are published yet.

## Risks and decisions
- Which projects appear is decided by the featured flag and their start date; there is no manual ordering.
- No new open-source building blocks were added.

## What's next
- Pages for individual articles and projects, then switch the card links to them.
