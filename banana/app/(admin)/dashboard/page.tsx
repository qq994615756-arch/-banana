'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  DollarSign,
  Image,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface DashboardStats {
  totalUsers: number
  todayNewUsers: number
  totalCredits: number
  todayImages: number
}

interface ImageRecord {
  id: string
  user_email: string
  prompt: string
  model: string
  credits: number
  status: string
  created_at: string
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
  completed: { label: '已完成', variant: 'secondary' },
  succeeded: { label: '已完成', variant: 'secondary' },
  processing: { label: '处理中', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const statsRes = await fetch(`${API_BASE}/admin/stats`)
      if (!statsRes.ok) throw new Error('获取统计数据失败')
      const statsData = await statsRes.json()

      if (statsData.code === 0) {
        setStats(statsData.data)
      }

      // 获取最近的生图记录
      const imagesRes = await fetch(`${API_BASE}/admin/images?limit=10`)
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json()
        if (imagesData.code === 0) {
          setImages(imagesData.data?.images || [])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const metrics = stats
    ? [
        {
          title: '总用户数',
          value: stats.totalUsers.toLocaleString(),
          icon: Users,
        },
        {
          title: '今日新增',
          value: stats.todayNewUsers.toLocaleString(),
          icon: TrendingUp,
        },
        {
          title: '总积分池',
          value: stats.totalCredits.toLocaleString(),
          icon: DollarSign,
        },
        {
          title: '今日生图',
          value: stats.todayImages.toLocaleString(),
          icon: Image,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">总览仪表盘</h1>
        <p className="text-sm text-slate-500 mt-1">
          查看系统整体运行状态和关键指标
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : metrics.map((metric) => (
              <Card key={metric.title} className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900">
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Image Generation Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            近期生图记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Image className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">暂无生图记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-slate-500 font-medium">ID</TableHead>
                  <TableHead className="text-slate-500 font-medium">用户</TableHead>
                  <TableHead className="text-slate-500 font-medium">提示词</TableHead>
                  <TableHead className="text-slate-500 font-medium">模型</TableHead>
                  <TableHead className="text-slate-500 font-medium text-right">
                    积分
                  </TableHead>
                  <TableHead className="text-slate-500 font-medium">状态</TableHead>
                  <TableHead className="text-slate-500 font-medium text-right">
                    创建时间
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {image.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {image.user_email}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                      {image.prompt}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {image.model}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-700">
                      {image.credits}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusConfig[image.status]?.variant || 'secondary'}
                        className="text-xs"
                      >
                        {statusConfig[image.status]?.label || image.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-500">
                      {new Date(image.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
