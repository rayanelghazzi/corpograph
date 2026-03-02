import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIVACY_NOTICE, TRANSACTION_TYPES, FUNDING_SOURCES } from "@/lib/constants";
import { createCase } from "@/api/cases";
import { uploadDocuments } from "@/api/documents";
import { runPhase } from "@/api/phases";

export function SubmitCasePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountType, setAccountType] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [serviceModel, setServiceModel] = useState<string>("");
  const [accountPurpose, setAccountPurpose] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [fundingSources, setFundingSources] = useState<string[]>([]);
  const [geographies, setGeographies] = useState("");
  const [consented, setConsented] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...newFiles].slice(0, 15));
    e.target.value = "";
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit =
    accountType && entityType && accountPurpose && monthlyVolume &&
    transactionTypes.length > 0 && fundingSources.length > 0 &&
    geographies.trim() && consented && files.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const caseRes = await createCase({
        intake: {
          account_type: accountType as "corporate_chequing" | "corporate_investing",
          entity_type: entityType as "corporation" | "trust" | "partnership",
          service_model: serviceModel ? (serviceModel as "OEO" | "managed") : undefined,
        },
        account_intent: {
          account_purpose: accountPurpose,
          expected_monthly_volume: Number(monthlyVolume),
          expected_transaction_types: transactionTypes,
          funding_sources: fundingSources,
          counterparty_geographies: geographies.split(",").map((g) => g.trim()).filter(Boolean),
        },
        consent: {
          privacy_notice_version: "1.0",
          acknowledged: true,
          consented_at: new Date().toISOString(),
        },
      });

      await uploadDocuments(caseRes.id, files);
      await runPhase(caseRes.id, 1);

      navigate("/submit/confirmation", { state: { caseId: caseRes.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Submit Onboarding Packet</h1>
        <p className="mt-1 text-muted-foreground">
          Complete all sections and upload corporate documents
        </p>
      </div>

      <div className="space-y-8">
        {/* Intake Information */}
        <Card className="shadow-none">
          <CardHeader><CardTitle>Intake Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate_chequing">Corporate Chequing</SelectItem>
                  <SelectItem value="corporate_investing">Corporate Investing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entity Type *</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service Model</Label>
              <Select value={serviceModel} onValueChange={setServiceModel}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OEO">OEO</SelectItem>
                  <SelectItem value="managed">Managed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Intent */}
        <Card className="shadow-none">
          <CardHeader><CardTitle>Account Intent</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Purpose *</Label>
              <Textarea value={accountPurpose} onChange={(e) => setAccountPurpose(e.target.value)} placeholder="Describe the purpose of the account..." />
            </div>
            <div className="space-y-2">
              <Label>Expected Monthly Volume *</Label>
              <Input type="number" value={monthlyVolume} onChange={(e) => setMonthlyVolume(e.target.value)} placeholder="e.g. 50000" />
            </div>
            <div className="space-y-2">
              <Label>Expected Transaction Types *</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSACTION_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted">
                    <Checkbox checked={transactionTypes.includes(t)} onCheckedChange={() => toggleItem(transactionTypes, t, setTransactionTypes)} />
                    {t.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Funding Sources *</Label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_SOURCES.map((s) => (
                  <label key={s} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted capitalize">
                    <Checkbox checked={fundingSources.includes(s)} onCheckedChange={() => toggleItem(fundingSources, s, setFundingSources)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Counterparty Geographies *</Label>
              <Input value={geographies} onChange={(e) => setGeographies(e.target.value)} placeholder="CA, US, GB (comma-separated country codes)" />
            </div>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className="shadow-none">
          <CardHeader><CardTitle>Consent</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              {PRIVACY_NOTICE}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={consented} onCheckedChange={(v) => setConsented(v === true)} />
              <span className="text-sm">I acknowledge and consent *</span>
            </label>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="shadow-none">
          <CardHeader><CardTitle>Document Upload</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/50">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload PDF files (max 15)</p>
              <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="ml-2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Case
        </Button>
      </div>
    </div>
  );
}
