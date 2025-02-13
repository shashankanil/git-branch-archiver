"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

const GithubLogin = () => {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    if (!clientId) {
      console.error("NEXT_PUBLIC_GITHUB_CLIENT_ID is not set")
      return
    }
    const redirectUri = "http://localhost:3000/api/auth/callback/github"
    const scope = "repo"

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Github className="h-6 w-6" />
          Git Branch Archiver
        </CardTitle>
        <CardDescription className="text-center">Sign in with GitHub to manage your repositories</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full flex items-center justify-center gap-2" onClick={handleLogin}>
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </Button>
      </CardContent>
    </Card>
  )
}

export default GithubLogin

