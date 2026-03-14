# Account Profile

## Goal

Give each user a simple place to manage identity, communication preferences, and profile details without turning the MVP into a settings-heavy application.

## Suggested Route

- `/account`

## Status

Planned.

## Shared Profile Sections

### Basic Identity

- full name
- email
- role
- profile photo later if needed

### Communication Preferences

- preferred notification channels
- reminder timing preference
- email vs in-app support preference

### Security

- password update later
- session awareness later
- no advanced security center in MVP

### Privacy And Consent

- basic privacy notice acknowledgement
- communication consent flags if required later

## Patient-Specific Sections

- condition summary
- therapy status
- next appointment visibility
- symptom baseline completion status
- preferred reminder window

## Provider-Specific Sections

For the MVP, provider settings can live inside `profiles`.

Later, if provider-specific settings grow, create a dedicated `provider_profiles` table for:

- specialty
- care coordination preferences
- notification rules
- default message tone or signature

## Current Data Alignment

Today the database already supports:

- `profiles`
- `patient_profiles`

That means the first account profile screen should be patient-friendly first and keep provider settings lightweight.

## Required Actions

- update name
- review role
- manage reminder preferences
- update basic therapy-facing profile details for patient role

## Out Of Scope

- billing settings
- insurance profile management
- enterprise organization management
- granular permission editors

## Acceptance Criteria

- A user can review and update their core personal details.
- A patient can control reminder preferences.
- The profile screen feels small and focused, not like a large admin console.
