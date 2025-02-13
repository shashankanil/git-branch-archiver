# Git Branch Archiver

This project allows users to archive branches in their GitHub repositories.

## Environment Variables

This project requires the following environment variables to be set:

- `GITHUB_CLIENT_ID`: Your GitHub OAuth App's Client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App's Client Secret
- `JWT_SECRET`: A secret key for signing JWTs (generate a random string)
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`: The same as GITHUB_CLIENT_ID, but accessible in the browser

### Local Development

For local development, create a `.env.local` file in the root of the project with the following content:

