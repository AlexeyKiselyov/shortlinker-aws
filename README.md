<h1 align = "center">SHORTLINKER API</h1>

### You can read more about the API in the **TASK-DESCRIPTION.md** file.

## Guide:

### Prerequisites

1. AWS CLI installed and configured.
2. <a href = "https://nodejs.org/uk" target="_blank" rel="noreferrer noopener">Need
   NODE.js.</a>
3. <a href = "https://github.com/serverless/serverless" target="_blank" rel="noreferrer noopener">Need
   serverless-framework.</a>
4. Create `.env` file using `.env.example` file.

### Installation

1. Open terminal in current directory.
2. To install modules run:

```bash
npm install
```

3. To add your AWS IAM credentials run:

```bash
serverless config credentials --provider aws --key <YourAccessKeyId> --secret <YourSecretAccessKey> profile serverlessUser
```

### Deployment

1. To deploy API on AWS run:

```bash
npm run deploy
```

2.  API will be available at the addresses that can be viewed in the terminal
    after the project deployment.

## Endpoints

- **POST /sign-up** - register new user
- **POST /sign-in** - login user

- **POST /link** - create new link
- **GET /link/{id}** - get link by id
- **GET /links** - get all user links
- **DELETE /link/{id}** - delete a link by id

---

<h2 align = "center"><a href="https://www.linkedin.com/in/olexiy-kiselyov/" target="_blank" rel="noreferrer noopener">
Linkedin of developer</a></h2>
