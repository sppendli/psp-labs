# The Reporting Was There. The System Underneath It Wasn't.

> Case Study · Craft Retail · North Vancouver, BC

---

There's a pattern that shows up in nearly every small operational business.

The COO opens a meeting. Someone pulls a number. Someone else disputes it. Twenty minutes later, the meeting is about the data — not the business.

That's where this client was.

---

## The Business

A craft food retailer with two store locations in North Vancouver. Operationally straightforward: consumer sales across product variants, hourly staff running scheduled shifts, and a COO managing the day-to-day.

The COO was the person responsible for tracking performance. Sales by location. Hours against demand. Costs against revenue. The kind of operational visibility that should be simple to get at.

It wasn't.

---

## The Setup

The reporting infrastructure was not absent. It was just broken in the way most small business reporting is broken. Not dramatically, but quietly.

The business used a Point of Sale (POS) system connected to a cloud data warehouse, which fed into Power BI via connector. Alongside it - a handful of Excel files imported manually which included a mapping spreadsheet the COO maintained himself to correct item names that came through dirty from the source system.

Two reports existed. One tracked sales by store and item. The other tracked hourly employee time.

On paper, the pieces were there.

---

## What Was Actually Broken

The problem was not the data. It was that no one had ever designed the system underneath those reports.

The tables came through as raw exports with no defined relationships between them. They sat disconnected in different models - each one an island. Visuals were built by dragging raw columns directly onto charts, which meant there were no reusable measures, no centralized business logic, and no consistent way to calculate anything across reports.

Column names were inconsistent and unreadable for a non-technical user. There were no base measures. No structure. Just a collection of tables that happened to be in the same file.

The consequence of this is predictable: when you build visuals on raw, unrelated tables, the numbers stop being trustworthy. Calculations become one-off. Filters break. Metrics that should match don't. And the person running the business spends time reconciling reports instead of reading them.

---

## The Diagnostic

The first question I asked was what the COO actually needed to do with this system.

The answer was clear. He wanted to be able to build reports himself. Drag a metric onto a chart. Filter by location. Pull a weekly summary. Nothing exotic. But it required a foundation that did not yet exist.

My review of the existing model confirmed the problem quickly:

- No relationships defined between tables
- Inconsistent and unreadable column names
- No calculated measures — raw columns used in place of defined metrics
- Excel correction sheets managed manually to patch upstream naming issues
- Unnecessary tables loaded into the model, adding weight without adding value

The fix was not a new dashboard. It was a semantic model. One that was designed properly, from the ground up.

---

## What I Built, and Why

The core of the work was a clean snowflake schema — fact tables connected to dimension tables through well-defined one-to-many relationships. Every table connected. Every relationship intentional.

A few specific decisions shaped the work:

**Kept the manual mapping workflow.** The Excel correction sheet wasn't ideal, but the root problem of inconsistent item names entered by hourly staff was ongoing and outside the scope of the system. Rather than pretend it wasn't there, I designed the model to accommodate it cleanly. The COO manages names at the source. The model reads them in correctly.

**Applied filters at the source.** Filters and transformations were pushed as early as possible in the pipeline. This reduced downstream compute and kept refresh performance reasonable given the periodic weekly/monthly cadence. Hence, no need for expensive optimization work that wasn't warranted.

**Disabled unnecessary table loads.** Several tables were present in the file but not needed in the model. Disabling their load improved performance without removing access to the underlying data.

**Renamed everything for readability.** Column names across all tables were standardized and made readable. The person building reports shouldn't need to decode field names.

**Wrote the base measures.** Sales totals, revenue aggregations, hours calculations — all defined once, centrally, and reusable across any visual that needed to be built.

Dashboard development wasn't part of the original scope, so I built mock versions of the existing report pages to validate that the numbers matched and the data mapping was correct. Once the COO confirmed the model was working as expected, the project was done.

---

## What Changed

After the build, the data was unified into a single, clean, well-structured semantic model. The COO could now build any visual needed by dragging in pre-defined measures. The numbers were consistent across reports because the logic that produced them lived in one place.

The operational reporting that should have been simple, actually became simple.

No more reconciling before meetings. No more manual checks against the raw data. The foundation was there, and the reporting worked the way it was supposed to.

---

## What This Project Taught Me

A few things became clear from this engagement that shape how I approach every project now.

**Small businesses don't need fancy. They need working.** The goal wasn't an elaborate system. It was a reliable one. The right answer was the simplest model that produced trustworthy numbers. Not the most technically impressive one.

**Scope matters more than speed.** Partway through the project, additional tables and requests came in. If the scope had been locked clearly at the start, the total output would have been cleaner, delivered faster, and likely more complete. That's a lesson I've since built into how every engagement begins.

**The foundation determines everything that follows.** You can't build reliable reporting on a broken model. You can't define consistent KPIs without a structured data layer underneath. And you can't trust a dashboard that's built on raw, unrelated tables. Fix the foundation first and everything built on top of it becomes simple.

---

> PSP Labs designs the reporting systems that make this kind of fix possible — in a scoped, time-boxed engagement. If your team is spending time reconciling numbers instead of reading them, that's a system problem. Let's talk.