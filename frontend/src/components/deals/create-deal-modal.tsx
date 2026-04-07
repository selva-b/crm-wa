"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDeal, usePipelines } from "@/hooks/use-deals";
import { useContacts } from "@/hooks/use-contacts";
import { useProducts } from "@/hooks/use-products";
import type { PipelineStage } from "@/lib/types/deals";

interface CreateDealModalProps {
  open: boolean;
  onClose: () => void;
  pipelineId?: string;
  stages?: PipelineStage[];
  prefilledContactId?: string;
  prefilledContactName?: string;
  lockContact?: boolean;
}

export function CreateDealModal({
  open,
  onClose,
  pipelineId: externalPipelineId,
  stages: externalStages,
  prefilledContactId,
  prefilledContactName,
  lockContact,
}: CreateDealModalProps) {
  const [title, setTitle] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [stageId, setStageId] = useState("");
  const [value, setValue] = useState("");
  const [expectedClose, setExpectedClose] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  // Auto-fetch pipelines when not provided externally
  const { data: pipelines } = usePipelines();
  const { data: products } = useProducts();
  const needsFetch = !externalPipelineId || !externalStages;

  const activePipelineId = externalPipelineId || selectedPipelineId;
  const activePipeline = pipelines?.find((p) => p.id === activePipelineId);
  const activeStages = externalStages || activePipeline?.stages || [];

  // Initialize pipeline and stage when data loads
  useEffect(() => {
    if (needsFetch && pipelines?.length && !selectedPipelineId) {
      const def = pipelines.find((p) => p.isDefault) || pipelines[0];
      setSelectedPipelineId(def.id);
      if (def.stages?.length) setStageId(def.stages[0].id);
    }
  }, [needsFetch, pipelines, selectedPipelineId]);

  // Set stage when external stages provided
  useEffect(() => {
    if (externalStages?.length && !stageId) {
      setStageId(externalStages[0].id);
    }
  }, [externalStages, stageId]);

  // Prefill contact
  useEffect(() => {
    if (prefilledContactId && open) {
      setSelectedContactId(prefilledContactId);
      setSelectedContactName(prefilledContactName || "");
    }
  }, [prefilledContactId, prefilledContactName, open]);

  const createDeal = useCreateDeal();
  const { data: contactsData } = useContacts(
    contactSearch.length >= 2 ? { search: contactSearch, limit: 5 } : undefined,
  );

  const handleSubmit = () => {
    if (!title.trim() || !selectedContactId || !stageId || !activePipelineId) return;
    createDeal.mutate(
      {
        pipelineId: activePipelineId,
        stageId,
        contactId: selectedContactId,
        title: title.trim(),
        value: value ? parseFloat(value) : undefined,
        expectedClose: expectedClose || undefined,
        productId: selectedProductId || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setContactSearch("");
          if (!lockContact) {
            setSelectedContactId(null);
            setSelectedContactName("");
          }
          setValue("");
          setExpectedClose("");
          onClose();
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/15 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-on-surface">Create Deal</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant">Deal Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Enterprise License" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant">Contact</label>
          {selectedContactId ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10">
              <span className="text-[13px] text-on-surface">{selectedContactName}</span>
              {!lockContact && (
                <button
                  onClick={() => { setSelectedContactId(null); setSelectedContactName(""); setContactSearch(""); }}
                  className="text-on-surface-variant hover:text-error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <>
              <Input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
              />
              {contactsData?.data && contactsData.data.length > 0 && (
                <div className="border border-outline-variant/10 rounded-lg overflow-hidden mt-1">
                  {contactsData.data.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedContactId(c.id);
                        setSelectedContactName(c.name || c.phoneNumber);
                        setContactSearch("");
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                    >
                      {c.name || c.phoneNumber}
                      {c.name && <span className="ml-2 text-on-surface-variant/60">{c.phoneNumber}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pipeline selector — only shown when not provided externally */}
        {needsFetch && pipelines && pipelines.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Pipeline</label>
            <select
              value={selectedPipelineId}
              onChange={(e) => {
                setSelectedPipelineId(e.target.value);
                const p = pipelines.find((pp) => pp.id === e.target.value);
                if (p?.stages?.length) setStageId(p.stages[0].id);
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] text-on-surface"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant">Stage</label>
          <select
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] text-on-surface"
          >
            {activeStages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Value</label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Expected Close</label>
            <Input type="date" value={expectedClose} onChange={(e) => setExpectedClose(e.target.value)} />
          </div>
        </div>

        {products && products.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] text-on-surface"
            >
              <option value="">No product</option>
              {products.filter((p) => p.status === "ACTIVE").map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || !selectedContactId || !activePipelineId || createDeal.isPending}
            loading={createDeal.isPending}
          >
            Create Deal
          </Button>
        </div>
      </div>
    </div>
  );
}
