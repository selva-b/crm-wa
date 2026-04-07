"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Plus,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Clock,
  UserPlus,
  Tag,
  Globe,
  Trash2,
  Sparkles,
  Bot,
  Upload,
  FileText,
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  useChatbotFlow,
  useSaveChatbotNodes,
  useUpdateChatbotFlow,
  useActivateChatbotFlow,
  useDeactivateChatbotFlow,
} from "@/hooks/use-chatbot";
import { useKbDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/use-knowledge-base";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { ChatbotNode, ChatbotNodeType } from "@/lib/types/chatbot";

const NODE_TYPES: { type: ChatbotNodeType; label: string; icon: typeof MessageSquare; color: string }[] = [
  { type: "SEND_MESSAGE", label: "Send Message", icon: MessageSquare, color: "#6366f1" },
  { type: "ASK_QUESTION", label: "Ask Question", icon: HelpCircle, color: "#3b82f6" },
  { type: "CONDITION", label: "Condition", icon: GitBranch, color: "#f59e0b" },
  { type: "DELAY", label: "Delay", icon: Clock, color: "#8b5cf6" },
  { type: "ASSIGN_AGENT", label: "Assign Agent", icon: UserPlus, color: "#22c55e" },
  { type: "SET_TAG", label: "Set Tag", icon: Tag, color: "#ec4899" },
  { type: "API_CALL", label: "API Call", icon: Globe, color: "#06b6d4" },
  { type: "AI_REPLY", label: "AI Reply", icon: Sparkles, color: "#f97316" },
];

interface CanvasNode extends ChatbotNode {
  // Extended for canvas rendering
}

export default function ChatbotEditorPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.id as string;

  const { data: flow, isLoading } = useChatbotFlow(flowId);
  usePageTitle(flow?.name || "Flow Editor");

  const saveNodes = useSaveChatbotNodes();
  const updateFlow = useUpdateChatbotFlow();
  const activateFlow = useActivateChatbotFlow();
  const deactivateFlow = useDeactivateChatbotFlow();

  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("");
  const [triggerType, setTriggerType] = useState("KEYWORD");
  const [triggerValue, setTriggerValue] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSystemPrompt, setAiSystemPrompt] = useState("");
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Document hooks
  const { data: documents } = useKbDocuments(flowId);
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const { data: availableProducts } = useProducts();

  // Initialize from flow data
  if (flow && !initialized) {
    setNodes(flow.nodes as CanvasNode[]);
    setFlowName(flow.name);
    setTriggerType(flow.trigger.type);
    setTriggerValue(flow.trigger.value || "");
    setAiEnabled(flow.aiEnabled ?? false);
    setAiSystemPrompt(flow.aiSystemPrompt ?? "");
    setUseKnowledgeBase(flow.useKnowledgeBase ?? false);
    setSelectedProductIds((flow as any).productIds ?? []);
    setInitialized(true);
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const addNode = useCallback((type: ChatbotNodeType) => {
    const newNode: CanvasNode = {
      id: crypto.randomUUID(),
      flowId,
      type,
      data: getDefaultData(type),
      position: { x: 250, y: (nodes.length + 1) * 120 },
      nextNodes: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, [nodes.length, flowId]);

  const updateNodeData = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const connectNodes = useCallback((fromId: string, toId: string, condition?: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === fromId
          ? { ...n, nextNodes: [...n.nextNodes.filter((nn) => nn.nodeId !== toId), { nodeId: toId, condition }] }
          : n,
      ),
    );
  }, []);

  const handleSave = () => {
    updateFlow.mutate({ flowId, name: flowName, trigger: { type: triggerType as any, value: triggerValue || undefined }, aiEnabled, aiSystemPrompt: aiSystemPrompt || undefined, useKnowledgeBase, productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined } as any);
    saveNodes.mutate({
      flowId,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: n.position,
        nextNodes: n.nextNodes,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <p className="text-on-surface-variant">Flow not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 bg-surface-container/30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/chatbot")} className="text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-[15px] font-semibold border-none bg-transparent px-0 w-[200px]"
          />
          <Badge variant={flow.isActive ? "success" : "muted"}>
            {flow.isActive ? "Active" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {flow.isActive ? (
            <Button variant="secondary" size="sm" onClick={() => deactivateFlow.mutate(flowId)}>
              <Pause className="h-3.5 w-3.5 mr-1.5" />
              Deactivate
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => activateFlow.mutate(flowId)} className="text-success">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Activate
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saveNodes.isPending || updateFlow.isPending}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Node palette */}
        <div className="w-[220px] shrink-0 border-r border-outline-variant/10 p-3 space-y-3 overflow-y-auto">
          {/* Trigger config */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Trigger</p>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10 text-[12px]"
            >
              <option value="KEYWORD">Keyword Match</option>
              <option value="FIRST_MESSAGE">First Message</option>
              <option value="BUTTON_REPLY">Button Reply</option>
            </select>
            {triggerType === "KEYWORD" && (
              <Input
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                placeholder="hello, hi, start"
                className="text-[12px]"
              />
            )}
          </div>

          {/* AI Auto-Reply */}
          <div className="border-t border-outline-variant/10 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">AI Auto-Reply</p>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative w-9 h-5 rounded-full transition-colors ${aiEnabled ? "bg-primary" : "bg-outline-variant/30"}`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${aiEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            {aiEnabled && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-on-surface-variant">System Prompt</label>
                <textarea
                  value={aiSystemPrompt}
                  onChange={(e) => setAiSystemPrompt(e.target.value)}
                  rows={4}
                  placeholder="You are a helpful customer support agent for [Your Company]. Be concise, friendly, and professional."
                  className="w-full px-2.5 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <p className="text-[10px] text-on-surface-variant/50">
                  When enabled, AI replies to every incoming message automatically. No nodes needed.
                </p>
              </div>
            )}
          </div>

          {/* Knowledge Base / Product Documents */}
          {/* Product Scope */}
          {aiEnabled && availableProducts && availableProducts.length > 0 && (
            <div className="border-t border-outline-variant/10 pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Product Scope</p>
              <p className="text-[10px] text-on-surface-variant/50">Select which products this chatbot handles. Leave empty for all.</p>
              {availableProducts.filter((p) => p.status === "ACTIVE").map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                      else setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                    }}
                    className="rounded border-outline-variant/30 text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-[12px] text-on-surface">{p.name}</span>
                </label>
              ))}
            </div>
          )}

          {aiEnabled && (
            <div className="border-t border-outline-variant/10 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Product Docs</p>
                </div>
                <button
                  onClick={() => setUseKnowledgeBase(!useKnowledgeBase)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${useKnowledgeBase ? "bg-primary" : "bg-outline-variant/30"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${useKnowledgeBase ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
              {useKnowledgeBase && (
                <div className="space-y-2">
                  {/* Upload button */}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-outline-variant/30 hover:border-primary/40 cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5 text-on-surface-variant" />
                    <span className="text-[11px] text-on-surface-variant">
                      {uploadDoc.isPending ? "Uploading..." : "Upload PDF / TXT"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.csv,.md"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadDoc.mutate({ file, flowId });
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>

                  {/* Document list */}
                  {documents && documents.length > 0 && (
                    <div className="space-y-1">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-container/50 text-[11px]"
                        >
                          <FileText className="h-3 w-3 shrink-0 text-on-surface-variant" />
                          <span className="flex-1 truncate text-on-surface">{doc.title}</span>
                          {doc.status === "READY" && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                          {doc.status === "PROCESSING" && <Loader2 className="h-3 w-3 text-warning shrink-0 animate-spin" />}
                          {doc.status === "FAILED" && <AlertTriangle className="h-3 w-3 text-error shrink-0" />}
                          <button
                            onClick={() => deleteDoc.mutate(doc.id)}
                            className="p-0.5 rounded hover:bg-error/10 text-on-surface-variant/30 hover:text-error transition-colors shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-on-surface-variant/50">
                    Upload product docs. AI will use them to answer customer questions.
                  </p>
                </div>
              )}
            </div>
          )}

          {!aiEnabled && (
            <div className="border-t border-outline-variant/10 pt-3">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Add Node</p>
              <div className="space-y-1.5">
                {NODE_TYPES.map((nt) => {
                  const Icon = nt.icon;
                  return (
                    <button
                      key={nt.type}
                      onClick={() => addNode(nt.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: nt.color + "20" }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: nt.color }} />
                      </div>
                      <span className="text-[12px] font-medium text-on-surface">{nt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto bg-surface-container/20 p-6">
          {nodes.length === 0 && aiEnabled ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-sm text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-on-surface">AI Auto-Reply Mode</h3>
                  <p className="text-[12px] text-on-surface-variant mt-1.5 leading-relaxed">
                    This chatbot uses AI to automatically reply to every customer message. No flow nodes needed.
                  </p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 text-left space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[12px] text-on-surface">AI Auto-Reply is ON</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {useKnowledgeBase ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    )}
                    <span className="text-[12px] text-on-surface">
                      Product Docs: {useKnowledgeBase ? "Enabled" : "Not enabled — AI will reply without product knowledge"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {documents && documents.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    )}
                    <span className="text-[12px] text-on-surface">
                      {documents && documents.length > 0
                        ? `${documents.length} document${documents.length > 1 ? "s" : ""} uploaded`
                        : "No documents — upload product PDFs in the left panel"}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-on-surface-variant/50 space-y-1">
                  <p>1. Upload product docs (left panel) → 2. Save → 3. Activate</p>
                  <p>Customers will get AI replies based on your product knowledge.</p>
                </div>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-on-surface-variant/40 text-[13px]">
              Add nodes from the left panel to build your flow
            </div>
          ) : (
            <div className="space-y-3">
              {/* Trigger indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-[12px] text-primary font-medium">
                <Play className="h-3.5 w-3.5" />
                Trigger: {triggerType === "KEYWORD" ? `"${triggerValue}"` : triggerType.replace("_", " ")}
              </div>

              {/* Nodes */}
              {nodes.map((node, idx) => {
                const nodeType = NODE_TYPES.find((nt) => nt.type === node.type);
                const Icon = nodeType?.icon || MessageSquare;
                const isSelected = selectedNodeId === node.id;

                return (
                  <div key={node.id}>
                    {idx > 0 && (
                      <div className="flex items-center justify-center py-1">
                        <div className="w-px h-6 bg-outline-variant/30" />
                      </div>
                    )}
                    <div
                      onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                      className={`relative w-[320px] rounded-xl border p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary shadow-md bg-surface-container-lowest"
                          : "border-outline-variant/10 bg-surface-container-lowest hover:border-outline-variant/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: (nodeType?.color || "#6b7280") + "15" }}
                        >
                          <Icon className="h-4 w-4" style={{ color: nodeType?.color || "#6b7280" }} />
                        </div>
                        <span className="text-[13px] font-semibold text-on-surface">{nodeType?.label || node.type}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                          className="ml-auto p-1 rounded text-on-surface-variant/30 hover:text-error transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Node data preview */}
                      {!!node.data.message && (
                        <p className="text-[12px] text-on-surface-variant line-clamp-2">
                          {String(node.data.message)}
                        </p>
                      )}
                      {!!node.data.question && (
                        <p className="text-[12px] text-on-surface-variant line-clamp-2">
                          Q: {String(node.data.question)}
                        </p>
                      )}
                      {node.type === "DELAY" && !!node.data.seconds && (
                        <p className="text-[12px] text-on-surface-variant">
                          Wait {String(node.data.seconds)}s
                        </p>
                      )}
                      {node.type === "AI_REPLY" && (
                        <p className="text-[12px] text-on-surface-variant line-clamp-2">
                          <Sparkles className="inline h-3 w-3 mr-1" />
                          {node.data.systemPrompt ? String(node.data.systemPrompt).slice(0, 60) + "..." : "AI-generated reply"}
                        </p>
                      )}
                      {node.type === "CONDITION" && !!node.data.field && (
                        <p className="text-[12px] text-on-surface-variant">
                          If {String(node.data.field)} {String(node.data.operator)} {String(node.data.value)}
                        </p>
                      )}

                      {/* Connection points */}
                      {node.nextNodes.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {node.nextNodes.map((nn) => (
                            <Badge key={nn.nodeId} variant="muted" className="text-[9px]">
                              {nn.condition ? `${nn.condition} →` : "→"} {nodes.find((n) => n.id === nn.nodeId)?.type || "?"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Node config panel */}
        {selectedNode && !aiEnabled && (
          <div className="w-[280px] shrink-0 border-l border-outline-variant/10 p-4 overflow-y-auto space-y-4">
            <h3 className="text-[14px] font-semibold text-on-surface">
              {NODE_TYPES.find((nt) => nt.type === selectedNode.type)?.label}
            </h3>

            {(selectedNode.type === "SEND_MESSAGE") && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant">Message</label>
                <textarea
                  value={String(selectedNode.data.message || "")}
                  onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Type message..."
                />
                <p className="text-[10px] text-on-surface-variant/50">
                  Use {"{{contact.name}}"} for variables
                </p>
              </div>
            )}

            {selectedNode.type === "ASK_QUESTION" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Question</label>
                  <textarea
                    value={String(selectedNode.data.question || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { question: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Ask a question..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Save answer as</label>
                  <Input
                    value={String(selectedNode.data.variableName || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { variableName: e.target.value })}
                    placeholder="e.g. customer_name"
                    className="text-[12px]"
                  />
                </div>
              </>
            )}

            {selectedNode.type === "CONDITION" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Variable</label>
                  <Input
                    value={String(selectedNode.data.field || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { field: e.target.value })}
                    placeholder="e.g. last_reply"
                    className="text-[12px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Operator</label>
                  <select
                    value={String(selectedNode.data.operator || "equals")}
                    onChange={(e) => updateNodeData(selectedNode.id, { operator: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10 text-[12px]"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="not_equals">Not Equals</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Value</label>
                  <Input
                    value={String(selectedNode.data.value || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
                    placeholder="Expected value"
                    className="text-[12px]"
                  />
                </div>
              </>
            )}

            {selectedNode.type === "DELAY" && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant">Delay (seconds)</label>
                <Input
                  type="number"
                  value={String(selectedNode.data.seconds || "5")}
                  onChange={(e) => updateNodeData(selectedNode.id, { seconds: parseInt(e.target.value) })}
                  className="text-[12px]"
                />
              </div>
            )}

            {selectedNode.type === "SET_TAG" && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant">Tag Name</label>
                <Input
                  value={String(selectedNode.data.tagName || "")}
                  onChange={(e) => updateNodeData(selectedNode.id, { tagName: e.target.value })}
                  placeholder="e.g. hot-lead"
                  className="text-[12px]"
                />
              </div>
            )}

            {selectedNode.type === "API_CALL" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">URL</label>
                  <Input
                    value={String(selectedNode.data.url || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                    placeholder="https://api.example.com/..."
                    className="text-[12px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Method</label>
                  <select
                    value={String(selectedNode.data.method || "GET")}
                    onChange={(e) => updateNodeData(selectedNode.id, { method: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10 text-[12px]"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
              </>
            )}

            {selectedNode.type === "AI_REPLY" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">System Prompt</label>
                  <textarea
                    value={String(selectedNode.data.systemPrompt || "")}
                    onChange={(e) => updateNodeData(selectedNode.id, { systemPrompt: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="You are a helpful support agent..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">Max Tokens</label>
                  <Input
                    type="number"
                    value={String(selectedNode.data.maxTokens || "500")}
                    onChange={(e) => updateNodeData(selectedNode.id, { maxTokens: parseInt(e.target.value) })}
                    className="text-[12px]"
                  />
                </div>
              </>
            )}

            {/* Connect to next node */}
            <div className="border-t border-outline-variant/10 pt-3 space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">Connect to next node</label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    connectNodes(selectedNode.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10 text-[12px]"
              >
                <option value="">Select node...</option>
                {nodes
                  .filter((n) => n.id !== selectedNode.id)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {NODE_TYPES.find((nt) => nt.type === n.type)?.label} - {String(n.data.message || n.data.question || n.type).slice(0, 30)}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultData(type: ChatbotNodeType): Record<string, unknown> {
  switch (type) {
    case "SEND_MESSAGE":
      return { message: "" };
    case "ASK_QUESTION":
      return { question: "", variableName: "" };
    case "CONDITION":
      return { field: "", operator: "equals", value: "" };
    case "DELAY":
      return { seconds: 5 };
    case "ASSIGN_AGENT":
      return { strategy: "round_robin" };
    case "SET_TAG":
      return { tagName: "" };
    case "API_CALL":
      return { url: "", method: "GET", headers: {}, saveAs: "" };
    case "AI_REPLY":
      return { systemPrompt: "You are a helpful customer support agent. Be concise and friendly.", maxTokens: 500 };
    default:
      return {};
  }
}
