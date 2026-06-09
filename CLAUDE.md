# Marfa Notes — Build 01

## Purpose
A personal notes app built as the first product in Product Studio University.
Primary capability being practiced: database creation and querying with SQLite.

## Stack
- Next.js (App Router)
- Tailwind CSS
- SQLite via better-sqlite3
- Deployed via Vercel + GitHub

## What Claude Code is allowed to do
- Create, edit, and delete any file within this project directory
- Install npm packages
- Run bash commands to start the dev server, run migrations, or verify output
- Make no external API calls — this product has no external dependencies

## What Claude Code is not allowed to do
- Modify anything outside the project directory
- Add authentication — this is a single-user local app
- Add any feature beyond note CRUD and color tagging

## Database
- SQLite via better-sqlite3
- Single table: notes
- Schema: id, title, body, color, created_at
- Database file lives at /db/notes.db

## Design system — Marfa aesthetic
- Background: #F5F0E8
- Text: warm charcoal, never pure black (#2C2825)
- Accent colors (note tags): muted terracotta, faded sage, dusty rose, warm sand, soft clay
- Typography: serif for note titles (Playfair Display or Lora), sans-serif for body (Inter)
- Spacing: generous — wider margins than feel necessary
- Cards: minimal border, whisper of elevation, no heavy shadows
- No gradients, no decorative icons, no purposeless animation

## Success criteria
- Notes persist across page refreshes
- Create, edit, delete all work
- Color tagging works and renders correctly in the grid
- Grid layout reflows correctly as notes are added
- Design matches the Marfa brief: spacious, warm, unhurried
