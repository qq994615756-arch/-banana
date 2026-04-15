"use client"

import { useState } from "react"
import { Check, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PricingPlan {
  id: string
  name: string
  tag: string
  validity: string
  price: number
  points: number
  highlighted?: boolean
}

const pricingPlans: PricingPlan[] = [
  { id: "1", name: "体验包", tag: "T1", validity: "有效期 30 天", price: 10, points: 500 },
  { id: "2", name: "月度会员", tag: "T2", validity: "有效期 30 天", price: 20, points: 1200 },
  { id: "3", name: "季度会员", tag: "T2", validity: "有效期 90 天", price: 30, points: 2000 },
  { id: "4", name: "季度会员", tag: "T2", validity: "有效期 90 天", price: 50, points: 3500 },
  { id: "5", name: "季度会员", tag: "T2", validity: "有效期 90 天", price: 100, points: 7500, highlighted: true },
  { id: "6", name: "季度会员", tag: "T2", validity: "有效期 90 天", price: 200, points: 16000, highlighted: true },
]

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const handleBuy = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setPaymentOpen(true)
  }

  const handlePaymentClose = () => {
    setPaymentOpen(false)
    setSelectedPlan(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 gap-0 bg-background border-border">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-foreground">充值套餐</DialogTitle>
            <DialogDescription className="sr-only">
              选择适合您的充值套餐，充值后积分立即到账
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-4">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} onBuy={handleBuy} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPlan && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={(o) => { if (!o) handlePaymentClose() }}
          plan={selectedPlan}
        />
      )}
    </>
  )
}

function PricingCard({ plan, onBuy }: { plan: PricingPlan; onBuy: (plan: PricingPlan) => void }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.validity}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
          {plan.tag}
        </span>
      </div>

      {/* Price and Points */}
      <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
        <div className="bg-background rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">价格</p>
          <p className="text-2xl font-bold text-foreground">
            <span className="text-base font-normal">¥</span>{plan.price}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">积分</p>
          <p className="text-2xl font-bold text-foreground">{plan.points.toLocaleString()}</p>
        </div>
      </div>

      {/* Feature */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Check className="h-4 w-4 text-green-500" />
        <span>充值后积分立即到账</span>
      </div>

      {/* Button */}
      <Button
        className={cn(
          "w-full mt-auto",
          plan.highlighted
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-foreground border border-border"
        )}
        variant={plan.highlighted ? "default" : "outline"}
        onClick={() => onBuy(plan)}
      >
        立即购买
      </Button>
    </div>
  )
}

// ──────────────────────────────────────────
// Payment QR Dialog
// ──────────────────────────────────────────

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PricingPlan
}

function PaymentDialog({ open, onOpenChange, plan }: PaymentDialogProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Fetch QR code from backend when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      setLoading(true)
      setQrUrl(null)
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
        const res = await fetch(`${apiBase}/api/payment/qrcode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.id, amount: plan.price }),
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setQrUrl(data.qrUrl as string)
      } catch (err) {
        // Fallback: use a placeholder QR for development
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay_plan_${plan.id}_amount_${plan.price}`
        )
      } finally {
        setLoading(false)
      }
    } else {
      setQrUrl(null)
      setLoading(false)
      setConfirming(false)
    }
    onOpenChange(isOpen)
  }

  const handleConfirmPaid = async () => {
    setConfirming(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
      const res = await fetch(`${apiBase}/api/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      toast.success(`充值成功，已到账 ${plan.points.toLocaleString()} 积分`)
      onOpenChange(false)
    } catch {
      toast.error("支付核验失败，请稍后重试或联系客服")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 bg-background border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">扫码支付</DialogTitle>
          <DialogDescription className="sr-only">
            扫描二维码完成支付
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 flex flex-col items-center gap-5">
          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">订阅购买</p>
            <p className="text-xl font-semibold text-foreground">
              扫码支付：<span className="text-primary font-bold">{plan.price} 元</span>
            </p>
          </div>

          {/* QR Code */}
          <div className="w-52 h-52 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="支付二维码"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <p className="text-xs text-muted-foreground text-center px-4">二维码加载失败，请关闭重试</p>
            )}
          </div>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            支付完成后请点击"已支付"按钮确认
          </p>

          {/* Notice */}
          <div className="w-full rounded-lg bg-muted/50 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              温馨提示：订阅会员一经购买，除法定情形或重大平台过错外，不支持退款。积分不可兑换会员、不可转赠，也不可提现；积分充值后有效期为 2 年，不支持退款或反向兑换为人民币。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
          >
            关闭
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirmPaid}
            disabled={loading || confirming}
          >
            {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            已支付
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
