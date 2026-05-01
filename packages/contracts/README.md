# C4C Chess
A full-stack chess platform inspired by modern online chess sites, with optional C4C token wagering on BNB Smart Chain.

## What is included

- `apps/web` - Next.js frontend with lobby, profile, wallet connection, and board UI
- `apps/api` - NestJS + Socket.IO backend for matchmaking, game state, and smart-contract calls
- `packages/contracts` - contract config and ABI placeholders for the C4C token and game escrow contract
- `docs` - step-by-step setup, Cursor workflow, and GitHub deployment notes

## Quick start

1. Install Node.js 20+
2. Run `npm install`
3. Copy `apps/api/.env.example` to `apps/api/.env`
4. Copy `apps/web/.env.example` to `apps/web/.env.local`
5. Run `npm run dev:api`
6. In a second terminal run `npm run dev:web`

Detailed setup is in `docs/setup.md`.

## Important security note

This repository includes a production-oriented structure, but the escrow flow depends on the actual behavior of your deployed game contract at `0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005`. Before launch, verify:

- ABI matches the contract on-chain
- stake custody rules are correct
- winner settlement cannot be spoofed by the server
- token decimals and allowance logic match C4C token behavior
- legal and regulatory constraints for token wagering in your region
