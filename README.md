# Shortlinker Api

## Prerequisites

- AWS CLI installed and configured
- [`serverless-framework`](https://github.com/serverless/serverless)
- [`node.js`](https://nodejs.org)

## Installation

Run:

```bash
npm install
```

## Deployment

Run:

```bash
serverless deploy
```

## Endpoints

- POST /sign-up - register new user
- POST /sign-in - login user

- POST /link - create new link
- GET /link/{id} - get link by id
- GET /links - get all user links
- DELETE /link/{id} - delete a link by id
