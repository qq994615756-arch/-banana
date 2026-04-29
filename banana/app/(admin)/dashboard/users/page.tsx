'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Search, Plus, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface User {
  id: string
  email: string
  credits: number
  plan: string
  created_at: string
  last_active: string
}

const planColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  Free: 'outline',
  Pro: 'default',
  Enterprise: 'secondary',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [recharging, setRecharging] = useState(false)

  const fetchUsers = useCallback(async (search = '') => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`${API_BASE}/admin/users?${params}`)
      if (!res.ok) throw new Error('获取用户列表失败')

      const data = await res.json()
      if (data.code === 0) {
        setUsers(data.data.users)
      } else {
        throw new Error(data.msg || '获取用户列表失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchUsers])

  const handleRechargeClick = (user: User) => {
    setSelectedUser(user)
    setRechargeAmount('')
    setDialogOpen(true)
  }

  const handleConfirmRecharge = async () => {
    if (!selectedUser || !rechargeAmount || Number(rechargeAmount) <= 0) return

    try {
      setRecharging(true)

      const res = await fetch(`${API_BASE}/admin/users/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: Number(rechargeAmount),
        }),
      })

      if (!res.ok) throw new Error('充值失败')

      const data = await res.json()
      if (data.code === 0) {
        // 更新本地用户列表
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, credits: data.data.credits } : u
          )
        )
        setDialogOpen(false)
        setSelectedUser(null)
        setRechargeAmount('')
      } else {
        throw new Error(data.msg || '充值失败')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '充值失败')
    } finally {
      setRecharging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理系统用户和积分充值
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          添加用户
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="搜索用户邮箱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-slate-200 bg-white"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-500 font-medium">ID</TableHead>
              <TableHead className="text-slate-500 font-medium">邮箱</TableHead>
              <TableHead className="text-slate-500 font-medium">套餐</TableHead>
              <TableHead className="text-slate-500 font-medium text-right">
                积分
              </TableHead>
              <TableHead className="text-slate-500 font-medium">
                注册时间
              </TableHead>
              <TableHead className="text-slate-500 font-medium">
                最近活跃
              </TableHead>
              <TableHead className="text-slate-500 font-medium text-right">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={planColors[user.plan] || 'outline'}
                      className="text-xs font-normal"
                    >
                      {user.plan || 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-700 font-medium">
                    {user.credits?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.last_active
                      ? new Date(user.last_active).toLocaleDateString('zh-CN')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-slate-600 hover:text-slate-900"
                      onClick={() => handleRechargeClick(user)}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      充值积分
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recharge Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>充值积分</DialogTitle>
            <DialogDescription>
              为{' '}
              <span className="font-medium text-foreground">
                {selectedUser?.email}
              </span>{' '}
              充值积分
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">当前积分</span>
              <span className="font-semibold text-foreground">
                {selectedUser?.credits?.toLocaleString() || 0}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recharge-amount">充值数量</Label>
              <Input
                id="recharge-amount"
                type="number"
                placeholder="输入积分数量"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                min="1"
                className="border-slate-200"
              />
            </div>

            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-slate-200"
                  onClick={() => setRechargeAmount(amount.toString())}
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-200"
              disabled={recharging}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmRecharge}
              disabled={!rechargeAmount || Number(rechargeAmount) <= 0 || recharging}
            >
              {recharging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  充值中...
                </>
              ) : (
                '确认充值'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
