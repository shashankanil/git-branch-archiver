"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import RepositorySelector from "@/components/RepositorySelector"
import type { Repository } from "@/components/RepositorySelector"

export default function RepositoriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const urlToken = searchParams.get("token")
    if (urlToken) {
      localStorage.setItem("github_token", urlToken)
      setToken(urlToken)
    } else {
      const storedToken = localStorage.getItem("github_token")
      if (!storedToken) {
        router.push("/")
        return
      }
      setToken(storedToken)
    }
  }, [router, searchParams])

  const handleRepositorySelect = (repo: Repository) => {
    const [owner, name] = repo.full_name.split('/')
    router.push(`/repositories/${owner}/${name}`)
  }

  if (!token) {
    return <div>Loading...</div>
  }

  return <RepositorySelector token={token} onSelectRepo={handleRepositorySelect} />
} 