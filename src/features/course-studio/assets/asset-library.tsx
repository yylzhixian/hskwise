'use client'

import { useState } from 'react'
import { AudioLines, ImageIcon, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MockAsset } from '../scene-schema/project-schema'
import { readText } from '../editor/studio-project'

type AssetLibraryProps = {
  assets: MockAsset[]
  locale: string
  onOpenChange: (open: boolean) => void
  onChangeAsset: (asset: MockAsset) => void
}

export function AssetLibrary({
  assets,
  locale,
  onOpenChange,
  onChangeAsset,
}: AssetLibraryProps) {
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(assets.map((asset) => [asset.id, asset.url ?? ''])),
  )
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({})

  function commitUrl(asset: MockAsset) {
    const draft = urlDrafts[asset.id]?.trim() ?? ''
    if (!draft) {
      setUrlErrors((current) => ({ ...current, [asset.id]: '' }))
      onChangeAsset({ ...asset, url: null })
      return
    }

    try {
      const parsedUrl = new URL(draft)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('unsupported protocol')
      setUrlErrors((current) => ({ ...current, [asset.id]: '' }))
      onChangeAsset({ ...asset, url: parsedUrl.toString() })
    } catch {
      setUrlErrors((current) => ({
        ...current,
        [asset.id]: 'Use a complete http:// or https:// URL.',
      }))
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100dvh-2rem))] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mock asset library</DialogTitle>
          <DialogDescription>
            Track temporary URLs and missing production assets without uploading files.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-auto">
          {assets.map((asset) => {
            const Icon = asset.kind === 'audio' ? AudioLines : asset.kind === 'video' ? Video : ImageIcon
            const error = urlErrors[asset.id]

            return (
              <div
                key={asset.id}
                className="grid gap-3 border-b border-border py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1.4fr)] sm:items-end"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{readText(asset.label, locale)}</p>
                    <p className="truncate text-xs text-muted-foreground">{asset.id}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">{asset.kind}</Badge>
                      {asset.durationMs ? (
                        <Badge variant="secondary">
                          {formatAssetDuration(asset.durationMs)}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={asset.status}
                    onValueChange={(value) =>
                      value && onChangeAsset({
                        ...asset,
                        status: value as MockAsset['status'],
                      })
                    }
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectGroup>
                      {['available', 'placeholder', 'missing'].map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectGroup></SelectContent>
                  </Select>
                </Field>

                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor={`asset-url-${asset.id}`}>Temporary URL</FieldLabel>
                  <Input
                    id={`asset-url-${asset.id}`}
                    inputMode="url"
                    placeholder="https://..."
                    value={urlDrafts[asset.id] ?? ''}
                    aria-invalid={Boolean(error)}
                    onChange={(event) =>
                      setUrlDrafts((current) => ({
                        ...current,
                        [asset.id]: event.target.value,
                      }))
                    }
                    onBlur={() => commitUrl(asset)}
                  />
                  {error ? <p className="text-xs text-destructive">{error}</p> : null}
                </Field>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatAssetDuration(durationMs: number) {
  return `${(durationMs / 1000).toFixed(1)}s`
}
