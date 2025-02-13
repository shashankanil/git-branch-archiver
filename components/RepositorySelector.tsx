"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Github, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Repository {
  id: number
  name: string
  full_name: string
  clone_url: string
  default_branch: string
}

const RepositorySelector = ({ token, onSelectRepo }: { token: string; onSelectRepo: (repo: Repository) => void }) => {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/repositories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch repositories")
      }

      const data = await response.json()
      setRepositories(data)
      setLoading(false)
    } catch (error) {
      setError("Failed to fetch repositories")
      setLoading(false)
    }
  }

  const filteredRepos = repositories.filter((repo) => repo.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Select a Repository</CardTitle>
        <CardDescription>Choose a repository to archive branches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <p>Loading repositories...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo) => (
                <Button
                  key={repo.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onSelectRepo(repo)}
                >
                  <Github className="w-4 h-4 mr-2" />
                  {repo.full_name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RepositorySelector

