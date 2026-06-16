"use client"

import React from "react"
import { VisionBoardItem } from "@/hooks/useVisionBoard"
import { motion, PanInfo } from "framer-motion"
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Type as TextIcon,
  Compass,
  Lightbulb,
} from "lucide-react"

const IMAGE_PRESETS = [
  { name: "Workspace", url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop&q=80" },
  { name: "Adventure Peak", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80" },
  { name: "Tech Device Setup", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" },
  { name: "Financial Success", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80" },
  { name: "Focus & Fitness", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
]

interface VisionBoardCanvasViewProps {
  boardItems: VisionBoardItem[]
  isLoading: boolean
  isError: boolean
  canvasRef: React.RefObject<HTMLDivElement | null>
  showAddMenu: boolean
  setShowAddMenu: (show: boolean) => void
  itemType: "text" | "image"
  setItemType: (type: "text" | "image") => void
  content: string
  setContent: (val: string) => void
  width: number
  setWidth: (val: number) => void
  height: number
  setHeight: (val: number) => void
  errorMsg: string | null
  handleAddItem: (e: React.FormEvent) => Promise<void>
  handleApplyPreset: (url: string) => void
  handleDeleteItem: (id: string, e: React.MouseEvent) => Promise<void>
  handleDragEnd: (item: VisionBoardItem, info: PanInfo) => void
  isPendingCreate: boolean
  isPendingDelete: boolean
}

export function VisionBoardCanvasView({
  boardItems,
  isLoading,
  isError,
  canvasRef,
  showAddMenu,
  setShowAddMenu,
  itemType,
  setItemType,
  content,
  setContent,
  width,
  setWidth,
  height,
  setHeight,
  errorMsg,
  handleAddItem,
  handleApplyPreset,
  handleDeleteItem,
  handleDragEnd,
  isPendingCreate,
  isPendingDelete,
}: VisionBoardCanvasViewProps) {
  return (
    <div className="space-y-6">
      {/* Tools control header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-0.5">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Workspace Canvas
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag items to plan out your visions. Absolute coordinates are auto-saved.
          </p>
        </div>

        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showAddMenu ? "Close Panel" : "Add Vision Item"}
        </button>
      </div>

      {/* Slide popover for adding note/images */}
      {showAddMenu && (
        <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="flex items-center gap-4 border-b border-border/40 pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Type:</span>
              <button
                type="button"
                onClick={() => {
                  setItemType("text")
                  setContent("")
                  setWidth(220)
                  setHeight(160)
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  itemType === "text"
                    ? "bg-violet-500/10 text-violet-500 border-violet-500/30"
                    : "border-border text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                <TextIcon className="h-3.5 w-3.5" /> Sticky Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType("image")
                  setContent("")
                  setWidth(240)
                  setHeight(160)
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  itemType === "image"
                    ? "bg-violet-500/10 text-violet-500 border-violet-500/30"
                    : "border-border text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" /> Image Card
              </button>
            </div>

            {/* Presets visual section for image items */}
            {itemType === "image" && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-violet-500" /> Presets Visual Wallpapers
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset.url)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${
                        content === preset.url
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {/* Content text block */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="itemContent" className="text-xs font-bold text-muted-foreground">
                  {itemType === "text" ? "Sticky Note Content *" : "Image Photo Link URL *"}
                </label>
                <input
                  id="itemContent"
                  type="text"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    itemType === "text"
                      ? "e.g., Code daily to build mastery! 🚀"
                      : "e.g., https://unsplash.com/..."
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
                />
              </div>

              {/* Sizes input controls */}
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="itemWidth" className="text-xs font-bold text-muted-foreground">Width (px)</label>
                  <input
                    id="itemWidth"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={120}
                    max={400}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="itemHeight" className="text-xs font-bold text-muted-foreground">Height (px)</label>
                  <input
                    id="itemHeight"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={100}
                    max={400}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPendingCreate}
                className="rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
              >
                {isPendingCreate ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Pin to Canvas"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Canvas workspace wrapper */}
      <div
        ref={canvasRef}
        className="relative w-full h-[650px] bg-secondary/10 dark:bg-slate-950/20 border border-border/80 rounded-2xl overflow-hidden shadow-inner backdrop-blur-[2px] select-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 select-none pointer-events-none">
            <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary mb-2" />
            <p className="text-xs text-muted-foreground font-semibold">Loading vision canvas...</p>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="rounded-full bg-destructive/10 p-4 mb-3 text-destructive">
              <AlertCircle className="h-9 w-9" />
            </div>
            <h4 className="text-sm font-bold text-destructive">Failed to Load Canvas</h4>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Error loading vision board items. Please check database connection.
            </p>
          </div>
        ) : boardItems.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 select-none pointer-events-none">
            <div className="rounded-full bg-secondary p-4 mb-3 text-muted-foreground/60">
              <Lightbulb className="h-9 w-9 text-violet-500" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Canvas is Empty</h4>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Pin stickies and visual wallpapers to define your goals. Click &quot;Add Vision Item&quot; at the top.
            </p>
          </div>
        ) : (
          boardItems.map((item: VisionBoardItem) => {
            const isText = item.type === "text"

            return (
              <motion.div
                key={item.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={canvasRef}
                onDragEnd={(event, info) => handleDragEnd(item, info)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  x: item.xOffset,
                  y: item.yOffset,
                  width: item.width,
                  height: item.height,
                  cursor: "grab",
                  zIndex: 10,
                }}
                whileDrag={{ scale: 1.03, cursor: "grabbing", zIndex: 50 }}
                className={`group rounded-xl overflow-hidden shadow-md flex flex-col justify-between border ${
                  isText
                    ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/5 dark:from-yellow-500/15 dark:to-transparent border-yellow-500/30 text-yellow-800 dark:text-yellow-200 p-2"
                    : "bg-card border-border/60"
                }`}
              >
                {/* Text Item Layout */}
                {isText ? (
                  <>
                    <div className="flex-1 overflow-y-auto leading-relaxed text-xs font-semibold pr-4.5 select-none leading-normal">
                      {item.content}
                    </div>

                    <div className="flex justify-between items-center border-t border-yellow-500/20 pt-2 text-[8px] font-black uppercase tracking-widest text-yellow-700/60 dark:text-yellow-500/60 shrink-0">
                      <span>Goal Note</span>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={isPendingDelete}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-yellow-500/20 transition-all text-yellow-800 dark:text-yellow-300 shrink-0"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  // Image Item Layout
                  <div className="relative w-full h-full">
                    {/* Visual image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.content}
                      alt="Vision board inspiration"
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />

                    {/* Delete button layer on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 select-none z-20">
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={isPendingDelete}
                        className="p-2 rounded-xl bg-rose-500/90 text-white hover:bg-rose-600 transition-all shadow-md active:scale-95 shrink-0"
                        aria-label="Delete image card"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
