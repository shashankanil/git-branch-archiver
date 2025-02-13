"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code")
    if (!code) {
      router.push("/")
      return
    }

    async function exchangeCode() {
      try {
        const response = await fetch("/api/github/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()
        if (data.access_token) {
          localStorage.setItem("github_token", data.access_token)
          router.push("/repositories")
        }
      } catch (error) {
        console.error("Error exchanging code:", error)
        router.push("/")
      }
    }

    exchangeCode()
  }, [router])

  return <div>Loading...</div>
} 