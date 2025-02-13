"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertCircle, Archive, GitBranch, ChevronDown, Trash2, ArchiveX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Branch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
  selected?: boolean
}

type Operation = 'archive-only' | 'archive-and-delete' | 'delete-only'

export default function RepositoryPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [archiving, setArchiving] = useState(false)
  const [lastArchived, setLastArchived] = useState<string[] | null>(null)
  const [operation, setOperation] = useState<Operation>('archive-and-delete')

  const owner = params.owner as string
  const name = params.name as string

  useEffect(() => {
    fetchBranches()
  }, [owner, name])

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("github_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/repositories/${owner}/${name}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch branches")
      }

      const branchData = await response.json()
      setBranches(branchData.map((branch: Branch) => ({
        ...branch,
        selected: false
      })))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching branches:", error)
      setError("Failed to fetch branches")
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    setBranches(branches.map(branch => ({
      ...branch,
      selected: true
    })))
  }

  const handleUnselectAll = () => {
    setBranches(branches.map(branch => ({
      ...branch,
      selected: false
    })))
  }

  const toggleBranch = (index: number) => {
    setBranches(branches.map((branch, i) => 
      i === index ? { ...branch, selected: !branch.selected } : branch
    ))
  }

  const handleOperation = async (op: Operation) => {
    setArchiving(true)
    setError(null)
    setLastArchived(null)
    
    try {
      const selectedBranches = branches.filter(b => b.selected).map(b => b.name)
      const token = localStorage.getItem("github_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      if (op !== 'delete-only') {
        const tagCheckPromises = selectedBranches.map(async (branch) => {
          const tagName = `archive/${branch.replace(/\//g, '-')}`
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${name}/git/refs/tags/${tagName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          )
          return { branch, tagExists: response.status === 200 }
        })

        const tagChecks = await Promise.all(tagCheckPromises)
        const existingTags = tagChecks.filter(check => check.tagExists)
        
        if (existingTags.length > 0) {
          setError(`Cannot process: Tags already exist for branches: ${existingTags.map(t => t.branch).join(', ')}`)
          setArchiving(false)
          return
        }
      }

      const response = await fetch(`/api/repositories/${owner}/${name}/archive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          branches: selectedBranches,
          operation: op
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process branches")
      }

      const { results } = await response.json()
      
      const successfulOperations = results.filter(r => r.success)
      const failedOperations = results.filter(r => !r.success)

      if (successfulOperations.length > 0) {
        const messages = successfulOperations.map(r => {
          const action = r.archived && r.deleted ? 'archived and deleted' :
                        r.archived ? 'archived' : 'deleted'
          return `${r.branch} (${action})`
        })
        setLastArchived(messages)
        
        if (op !== 'archive-only') {
          setBranches(branches.filter(b => 
            !successfulOperations.find(r => r.branch === b.name && r.deleted)
          ))
        }

        setBranches(prev => prev.map(branch => ({
          ...branch,
          selected: false
        })))
      }

      if (failedOperations.length > 0) {
        setError(`Failed operations: ${failedOperations.map(r => `${r.branch} (${r.error})`).join(', ')}`)
      }

    } catch (error) {
      console.error("Error processing branches:", error)
      setError("Failed to process branches")
    } finally {
      setArchiving(false)
    }
  }

  if (loading) {
    return <div>Loading repository details...</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Repository: {owner}/{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              onClick={handleUnselectAll}
              className="flex items-center gap-2"
            >
              Unselect All
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  disabled={!branches.some(b => b.selected) || archiving}
                  className="flex items-center gap-2 ml-auto"
                >
                  {archiving ? 'Processing...' : 'Process Selected'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleOperation('archive-only')}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOperation('archive-and-delete')}>
                  <ArchiveX className="h-4 w-4 mr-2" />
                  Archive and Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOperation('delete-only')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {lastArchived && lastArchived.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully processed: {lastArchived.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg">
            <div className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 border-b bg-muted/50">
              <div>Select</div>
              <div>Branch Name</div>
              <div>Protected</div>
            </div>
            <div className="divide-y">
              {branches.map((branch, index) => (
                <div 
                  key={branch.name}
                  className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 items-center hover:bg-muted/50"
                >
                  <Checkbox
                    checked={branch.selected}
                    onCheckedChange={() => toggleBranch(index)}
                    disabled={branch.protected}
                  />
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    {branch.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {branch.protected ? "Yes" : "No"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 