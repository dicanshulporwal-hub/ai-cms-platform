# Department & Contact Directory Module

## Overview

Manages government department hierarchy, officer profiles, designations, office locations, and a public contact directory. Supports privacy controls for which contact information is visible publicly.

## Data Models

### Department (extended)
- Hierarchy: parentId → children (tree structure)
- Types: DEPARTMENT, DIVISION, SECTION, UNIT, OFFICE, CELL, COMMITTEE
- Status: ACTIVE, INACTIVE, ARCHIVED
- Backward-compatible with Schemes & Services (existing `items` relation preserved)

### OfficerProfile
- fullName, slug, designation, department
- Public/private email/phone fields
- isPublic flag controls public visibility
- Status: ACTIVE, INACTIVE, TRANSFERRED, RETIRED

### Designation
- Name, slug, level, sortOrder
- Linked to officers

### OfficeLocation
- Name, address, city, state, pincode
- Optional GPS coordinates (latitude/longitude)
- Linked to department

### ContactDirectorySettings
- Controls what's visible publicly (email, phone, address, org chart, dept pages)

## Admin Routes

| Route | Purpose |
|-------|---------|
| /contact-directory | Dashboard with summary cards |
| /contact-directory/departments | Department management |
| /contact-directory/officers | Officer profiles with search/filter |
| /contact-directory/designations | Designation management |

## Public Routes

| Route | Purpose |
|-------|---------|
| /contact-directory | Public officer directory with search |
| /departments | Department listing |
| /departments/:slug | Department detail with officers |

## Privacy Controls

Settings in `ContactDirectorySettings` control:
- `isPublicDirectoryEnabled` — Master toggle for public directory
- `showOfficerEmail` — Show/hide email in public directory
- `showOfficerPhone` — Show/hide phone in public directory
- `showOfficeAddress` — Show/hide office address
- `enableOrgChart` — Enable organization chart view
- `enableDepartmentPages` — Enable individual department pages

Officers with `isPublic: false` never appear publicly regardless of settings.

## Green Code Compliance

- All list endpoints paginated with `take` limit
- `select` for specific fields (no full record fetch)
- Public endpoints only show ACTIVE + isPublic records
- Department tree built in-memory from flat list (single query)
- Settings fetched once per public request (no N+1)
- Circular hierarchy prevention on create/update

## Sidebar Location

Under **Government Modules** → Depts & Contacts (Overview, Departments, Officers, Designations)
