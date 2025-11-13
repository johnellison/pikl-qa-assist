'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Save,
  RefreshCw,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import {
  DEFAULT_COMPLIANCE_RULES,
  getRulesForCallType,
  generateCompliancePrompt,
} from '@/lib/compliance-rules';
import type { ComplianceRule, CallType, ComplianceDimension } from '@/types/compliance-rules';

const CALL_TYPES: { value: CallType; label: string }[] = [
  { value: 'new_business_sales', label: 'New Business Sales' },
  { value: 'renewals', label: 'Renewals' },
  { value: 'mid_term_adjustment', label: 'Mid-Term Adjustment' },
  { value: 'claims_inquiry', label: 'Claims Inquiry' },
  { value: 'complaints', label: 'Complaints' },
  { value: 'general_inquiry', label: 'General Inquiry' },
];

const DIMENSIONS: { value: ComplianceDimension; label: string; emoji: string }[] = [
  { value: 'callOpeningCompliance', label: 'Call Opening', emoji: '📞' },
  { value: 'dataProtectionCompliance', label: 'Data Protection', emoji: '🔒' },
  { value: 'mandatoryDisclosures', label: 'Mandatory Disclosures', emoji: '📋' },
  { value: 'tcfCompliance', label: 'Treating Customers Fairly', emoji: '🤝' },
  { value: 'salesProcessCompliance', label: 'Sales Process', emoji: '💼' },
  { value: 'complaintsHandling', label: 'Complaints Handling', emoji: '📢' },
];

export default function ComplianceRulesPage() {
  const [rules, setRules] = useState<ComplianceRule[]>(DEFAULT_COMPLIANCE_RULES);
  const [selectedCallType, setSelectedCallType] = useState<CallType>('new_business_sales');
  const [selectedDimension, setSelectedDimension] = useState<ComplianceDimension | 'all'>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Filter rules based on selections
  const filteredRules = rules.filter((rule) => {
    const matchesCallType = rule.applicableCallTypes.includes(selectedCallType);
    const matchesDimension = selectedDimension === 'all' || rule.dimension === selectedDimension;
    return matchesCallType && matchesDimension;
  });

  const toggleRuleEnabled = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
    setHasChanges(true);
  };

  const toggleRuleForCallType = (ruleId: string, callType: CallType) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        const newCallTypes = rule.applicableCallTypes.includes(callType)
          ? rule.applicableCallTypes.filter((ct) => ct !== callType)
          : [...rule.applicableCallTypes, callType];
        return { ...rule, applicableCallTypes: newCallTypes };
      })
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // In MVP, just simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all rules to defaults? This will discard your changes.')) {
      setRules(DEFAULT_COMPLIANCE_RULES);
      setHasChanges(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const activeRulesCount = rules.filter((r) => r.enabled).length;
  const totalRulesCount = rules.length;
  const callTypeRulesCount = getRulesForCallType(selectedCallType).length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            Compliance Rules Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure which compliance requirements apply to different call types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'}>
            <Save className="mr-2 h-4 w-4" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus === 'saved' && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Compliance rules saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to save rules. Please try again.</AlertDescription>
        </Alert>
      )}

      {hasChanges && (
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription>You have unsaved changes</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRulesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeRulesCount} active, {totalRulesCount - activeRulesCount} disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active for Selected Call Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callTypeRulesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rules applying to {CALL_TYPES.find((ct) => ct.value === selectedCallType)?.label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter((r) => r.severity === 'critical' && r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Must be complied with</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filter Rules
          </CardTitle>
          <CardDescription>Select call type and dimension to view applicable rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Call Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Call Type</label>
            <div className="flex gap-2 flex-wrap">
              {CALL_TYPES.map((ct) => (
                <Button
                  key={ct.value}
                  variant={selectedCallType === ct.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCallType(ct.value)}
                >
                  {ct.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Dimension Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Compliance Dimension</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDimension === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('all')}
              >
                All Dimensions
              </Button>
              {DIMENSIONS.map((dim) => (
                <Button
                  key={dim.value}
                  variant={selectedDimension === dim.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDimension(dim.value)}
                >
                  {dim.emoji} {dim.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Rules for {CALL_TYPES.find((ct) => ct.value === selectedCallType)?.label} (
          {filteredRules.length})
        </h2>

        {filteredRules.map((rule) => (
          <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{rule.title}</CardTitle>
                    <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {DIMENSIONS.find((d) => d.value === rule.dimension)?.emoji}{' '}
                      {DIMENSIONS.find((d) => d.value === rule.dimension)?.label}
                    </Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRuleEnabled(rule.id)} />
                  <span className="text-sm text-muted-foreground">
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Regulatory Reference */}
              <div>
                <span className="text-sm font-semibold">Regulatory Reference: </span>
                <span className="text-sm text-muted-foreground">{rule.regulatoryReference}</span>
              </div>

              {/* Requirement */}
              <div>
                <span className="text-sm font-semibold block mb-1">Requirement:</span>
                <p className="text-sm text-muted-foreground">{rule.requirement}</p>
              </div>

              {/* Example Script */}
              {rule.exampleScript && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <span className="text-sm font-semibold block mb-1">Example Script:</span>
                  <p className="text-sm italic">"{rule.exampleScript}"</p>
                </div>
              )}

              {/* Applicable Call Types */}
              <div>
                <span className="text-sm font-semibold block mb-2">Applies to Call Types:</span>
                <div className="flex gap-2 flex-wrap">
                  {CALL_TYPES.map((ct) => {
                    const isApplicable = rule.applicableCallTypes.includes(ct.value);
                    return (
                      <Badge
                        key={ct.value}
                        variant={isApplicable ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleRuleForCallType(rule.id, ct.value)}
                      >
                        {ct.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {rule.notes && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-900">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-semibold block mb-1">Notes:</span>
                      <p className="text-sm text-muted-foreground">{rule.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredRules.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No rules match the selected filters. Try selecting a different call type or dimension.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Prompt Preview</CardTitle>
          <CardDescription>
            This is how active rules will be presented to Claude during analysis for{' '}
            {CALL_TYPES.find((ct) => ct.value === selectedCallType)?.label} calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
            {generateCompliancePrompt(selectedCallType)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
