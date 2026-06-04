import { useState, useEffect } from "react";
import { Key, Plus, Trash2, RefreshCw, Power, PowerOff, Check, Copy, CalendarDays, Clock, Activity, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "@layouts/DashboardLayout";
import PageLoader from "@shared/components/ui/PageLoader";
import {
  type ApiKey,
  getApiKeys,
  createApiKey,
  regenerateApiKey,
  toggleApiStatus,
  deleteApiKey,
} from "@features/apiKeys/services/apiKey.service";

function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30); // Default to 30 days

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());

  const [actionModal, setActionModal] = useState<{
    type: "delete" | "toggle" | "regenerate";
    keyData: ApiKey;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await getApiKeys();
      if (res.success) {
        setKeys(res.apis);
      }
    } catch (error) {
      console.error("Failed to fetch API keys", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error("API key name is required");
      return;
    }
    try {
      let expires_at: string | undefined = undefined;
      if (expiresInDays !== null) {
        const date = new Date();
        if (expiresInDays === -1) {
          date.setSeconds(date.getSeconds() + 10);
        } else {
          date.setDate(date.getDate() + expiresInDays);
        }
        expires_at = date.toISOString();
      }

      const res = await createApiKey(newKeyName, expires_at);
      if (res.success && res.api) {
        toast.success("API key created");
        setKeys([res.api, ...keys]);
        setNewKeyName("");
        setExpiresInDays(30);
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create API key", error);
      toast.error("Failed to create API key");
    }
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    const { type, keyData } = actionModal;
    setIsProcessing(true);
    try {
      if (type === "delete") {
        const res = await deleteApiKey(keyData.id);
        if (res.success) {
          toast.success("API key deleted");
          setKeys(keys.filter((k) => k.id !== keyData.id));
        }
      } else if (type === "toggle") {
        const res = await toggleApiStatus(keyData.id);
        if (res.success && res.api) {
          toast.success(`API key ${res.api.status === "active" ? "activated" : "deactivated"}`);
          setKeys(keys.map((k) => (k.id === keyData.id ? res.api : k)));
        }
      } else if (type === "regenerate") {
        const res = await regenerateApiKey(keyData.id);
        if (res.success && res.api) {
          toast.success("API key regenerated");
          setKeys(keys.map((k) => (k.id === keyData.id ? res.api : k)));
        }
      }
    } catch (error) {
      console.error(`Failed to ${type} API key`, error);
      toast.error(`Failed to ${type} API key`);
    } finally {
      setIsProcessing(false);
      setActionModal(null);
    }
  };

  const handleCopy = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("API key copied to clipboard");
  };

  if (loading) return <PageLoader />;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">API Keys</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Manage API keys for external access to your portfolio data.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus size={18} />
          Create New Key
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create New API Key</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Key Name (e.g., Mobile App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 outline-none focus:border-primary"
            />
            
            <select
              value={expiresInDays === null ? "" : expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value === "" ? null : Number(e.target.value))}
              className="w-40 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-2.5 text-sm outline-none"
            >
              <option value={-1}>10 seconds (Testing)</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
              <option value="">Never expire</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-[var(--border-color)] px-4 py-2 font-medium hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {keys.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] border-dashed py-20 text-center">
          <div className="mb-4 rounded-full bg-[var(--bg-secondary)] p-4">
            <Key size={32} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No API Keys</h3>
          <p className="mb-6 max-w-md text-[var(--text-muted)]">
            You haven't created any API keys yet. Create one to allow external applications to access your portfolio data.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Plus size={18} />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {keys.map((key) => {
            const expired = key.expires_at ? new Date(key.expires_at) < new Date() : false;
            const daysLeft = key.expires_at ? Math.ceil((new Date(key.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            
            return (
            <div
              key={key.id}
              className={`group flex flex-col gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-6 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                expired ? "opacity-60 grayscale-[50%]" : ""
              }`}
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">{key.name}</h3>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${
                        key.status === "active" && !expired
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {key.status === "active" && !expired ? "Active" : "Inactive"}
                    </span>
                    {expired && (
                      <span className="rounded-full px-3 py-1 text-xs font-medium border bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Expired
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex w-full sm:w-[640px] items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1.5 pl-4 pr-1.5 transition-colors group-hover:border-primary/30 shadow-inner">
                    <code className="truncate text-sm font-mono text-[var(--text-main)] tracking-wider">
                      {visibleKeys.has(key.id) ? key.api_key : `${key.api_key.substring(0, 15)}****************************************`}
                    </code>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleVisibility(key.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] shadow-sm transition-all hover:text-primary hover:shadow hover:-translate-y-0.5 active:scale-95 border border-[var(--border-color)]"
                        title={visibleKeys.has(key.id) ? "Hide API Key" : "Show API Key"}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleCopy(key.api_key, key.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] shadow-sm transition-all hover:text-primary hover:shadow hover:-translate-y-0.5 active:scale-95 border border-[var(--border-color)]"
                        title="Copy API Key"
                      >
                        {copiedId === key.id ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5" title="Created date">
                    <CalendarDays size={16} className="opacity-70" />
                    <span>{new Date(key.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {key.last_used_at && (
                    <div className="flex items-center gap-1.5" title="Last used date">
                      <Clock size={16} className="opacity-70" />
                      <span>Used {new Date(key.last_used_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {key.expires_at && (
                    <div className={`flex items-center gap-1.5 font-medium ${expired ? "text-gray-500" : "text-orange-500/90"}`} title="Expiration date">
                      <Clock size={16} className="opacity-70" />
                      <span>
                        {expired ? "Expired on" : "Expires"} {new Date(key.expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {!expired && daysLeft !== null && ` (${daysLeft === 0 ? "today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`})`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5" title="Rate limit">
                    <Activity size={16} className="opacity-70" />
                    <span>{key.rate_limit} req/hr</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-5 sm:border-t-0 sm:pt-0">
                <button
                  onClick={() => {
                    if (expired) {
                      toast.error("Cannot toggle an expired API key");
                    } else {
                      setActionModal({ type: "toggle", keyData: key });
                    }
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all hover:bg-[var(--bg-main)] hover:shadow-sm hover:-translate-y-0.5 ${
                    expired 
                      ? "cursor-not-allowed opacity-50 text-[var(--text-muted)]" 
                      : key.status === "active" ? "text-orange-500 hover:border-orange-500/30" : "text-green-500 hover:border-green-500/30"
                  }`}
                  title={expired ? "Expired Key" : key.status === "active" ? "Deactivate Key" : "Activate Key"}
                >
                  {key.status === "active" && !expired ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <button
                  onClick={() => {
                    if (expired) {
                      toast.error("Cannot regenerate an expired API key");
                    } else if (key.status === "inactive") {
                      toast.error("Cannot regenerate a deactivated API key");
                    } else {
                      setActionModal({ type: "regenerate", keyData: key });
                    }
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all hover:bg-[var(--bg-main)] hover:text-primary hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5 ${
                    key.status === "inactive" || expired ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  title={expired ? "Expired Key" : "Regenerate Key"}
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={() => setActionModal({ type: "delete", keyData: key })}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 hover:shadow-sm hover:-translate-y-0.5"
                  title="Delete Key"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* =========================
          ACTION MODAL
      ========================= */}

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-2xl">
            <h3 className="text-xl font-bold">
              {actionModal.type === "delete" && "Delete API Key"}
              {actionModal.type === "toggle" && (actionModal.keyData.status === "active" ? "Deactivate API Key" : "Activate API Key")}
              {actionModal.type === "regenerate" && "Regenerate API Key"}
            </h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              {actionModal.type === "delete" && `Are you sure you want to permanently delete "${actionModal.keyData.name}"? This action cannot be undone.`}
              {actionModal.type === "toggle" && `Are you sure you want to ${actionModal.keyData.status === "active" ? "deactivate" : "activate"} "${actionModal.keyData.name}"?`}
              {actionModal.type === "regenerate" && `Are you sure you want to regenerate "${actionModal.keyData.name}"? This will invalidate the old key immediately.`}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={isProcessing}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmAction}
                disabled={isProcessing}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 disabled:opacity-50 ${
                  actionModal.type === "delete" ? "bg-red-500 hover:bg-red-600" :
                  actionModal.type === "regenerate" ? "bg-orange-500 hover:bg-orange-600" :
                  actionModal.type === "toggle" && actionModal.keyData.status === "active" ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-950" :
                  actionModal.type === "toggle" && actionModal.keyData.status === "inactive" ? "bg-green-500 hover:bg-green-600" :
                  "bg-primary hover:bg-primary/90"
                }`}
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ApiKeys;
