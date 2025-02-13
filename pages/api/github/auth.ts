import type { NextApiRequest, NextApiResponse } from "next"
import { sign } from "jsonwebtoken"

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const JWT_SECRET = process.env.JWT_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !JWT_SECRET) {
    console.error("Missing required environment variables")
    return res.status(500).json({ error: "Server configuration error" })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: "Code is required" })
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error })
    }

    const accessToken = tokenData.access_token

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()

    // Create JWT
    const token = sign(
      {
        sub: userData.id.toString(),
        name: userData.login,
        github_token: accessToken,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day expiration
      },
      JWT_SECRET,
      { algorithm: "HS256" },
    )

    return res.status(200).json({ access_token: token, token_type: "bearer" })
  } catch (error) {
    console.error("Error during GitHub authentication:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

