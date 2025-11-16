import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { TV_OBJECT_TYPES, TV_OBJECT_SCHEMAS, type TVObjectType } from "@shared/tvobjects";
import Papa from "papaparse";

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface ColumnMapping {
  [csvColumn: string]: {
    field: "title" | "content" | "attribute";
    attributeName?: string;
  };
}

export default function Import() {
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "json" | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedType, setSelectedType] = useState<TVObjectType | undefined>(undefined);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const utils = trpc.useUtils();
  const bulkCreateMutation = trpc.notes.bulkCreate.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      utils.graph.data.invalidate();
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setImportResult(null);

    const extension = uploadedFile.name.split(".").pop()?.toLowerCase();
    
    if (extension === "csv") {
      setFileType("csv");
      parseCSV(uploadedFile);
    } else if (extension === "json") {
      setFileType("json");
      parseJSON(uploadedFile);
    } else {
      alert("Please upload a CSV or JSON file");
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        setParsedData({ headers, rows });
        
        // Auto-detect common mappings
        const autoMapping: ColumnMapping = {};
        headers.forEach(header => {
          const lower = header.toLowerCase();
          if (lower.includes("title") || lower.includes("name")) {
            autoMapping[header] = { field: "title" };
          } else if (lower.includes("content") || lower.includes("description") || lower.includes("text")) {
            autoMapping[header] = { field: "content" };
          }
        });
        setColumnMapping(autoMapping);
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const parseJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Handle array of objects
        if (Array.isArray(json)) {
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          setParsedData({ headers, rows: json });
          
          // Auto-detect mappings
          const autoMapping: ColumnMapping = {};
          headers.forEach(header => {
            const lower = header.toLowerCase();
            if (lower.includes("title") || lower.includes("name")) {
              autoMapping[header] = { field: "title" };
            } else if (lower.includes("content") || lower.includes("description") || lower.includes("text")) {
              autoMapping[header] = { field: "content" };
            }
          });
          setColumnMapping(autoMapping);
        } else {
          alert("JSON must be an array of objects");
        }
      } catch (error) {
        alert("Error parsing JSON: Invalid format");
      }
    };
    reader.readAsText(file);
  };

  const updateMapping = (csvColumn: string, field: "title" | "content" | "attribute", attributeName?: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: { field, attributeName },
    }));
  };

  const handleImport = async () => {
    if (!parsedData || !selectedType) {
      alert("Please select a TV-Object type and map columns");
      return;
    }

    setIsImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const notesToCreate = parsedData.rows.map((row, index) => {
        let title = "";
        let content = "";
        const attributes: Record<string, any> = {};

        // Apply mappings
        Object.entries(columnMapping).forEach(([csvColumn, mapping]) => {
          const value = row[csvColumn];
          if (!value) return;

          if (mapping.field === "title") {
            title = value;
          } else if (mapping.field === "content") {
            content = value;
          } else if (mapping.field === "attribute" && mapping.attributeName) {
            attributes[mapping.attributeName] = value;
          }
        });

        if (!title) {
          errors.push(`Row ${index + 1}: Missing title`);
          return null;
        }

        return {
          title,
          content: content || "",
          tvObjectType: selectedType,
          tvObjectAttributes: Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : undefined,
        };
      }).filter(note => note !== null);

      if (notesToCreate.length === 0) {
        alert("No valid notes to import");
        setIsImporting(false);
        return;
      }

      // Call bulk create mutation
      await bulkCreateMutation.mutateAsync({ notes: notesToCreate as any });
      successCount = notesToCreate.length;

      setImportResult({ success: successCount, errors });
    } catch (error) {
      errors.push("Import failed: " + (error as Error).message);
      setImportResult({ success: successCount, errors });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "title,content,date,location,description\nExample Event,This is an example event,2024-01-01,Paris,A sample event for import";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Upload className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">Sign in to import data</h2>
        <a href={getLoginUrl()} className="text-blue-500 hover:underline">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Upload className="w-6 h-6" />
              <h1 className="text-xl font-bold">Import Data</h1>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Upload Section */}
        {!parsedData && (
          <Card className="p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Upload CSV or JSON File</h2>
              <p className="text-muted-foreground mb-6">
                Import multiple notes at once from a structured data file
              </p>
              <Input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="max-w-md mx-auto"
              />
              <p className="text-sm text-muted-foreground mt-4">
                Supported formats: CSV, JSON (array of objects)
              </p>
            </div>
          </Card>
        )}

        {/* Mapping Section */}
        {parsedData && !importResult && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Step 1: Select TV-Object Type</h3>
              <div className="flex items-center gap-4">
                <Label>Type:</Label>
                <Select value={selectedType || "none"} onValueChange={(value) => setSelectedType(value === "none" ? undefined : value as TVObjectType)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Regular Note</SelectItem>
                    {TV_OBJECT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Step 2: Map Columns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found {parsedData.rows.length} rows with {parsedData.headers.length} columns
              </p>
              
              <div className="space-y-3">
                {parsedData.headers.map(header => (
                  <div key={header} className="flex items-center gap-4 p-3 bg-accent/50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{header}</div>
                      <div className="text-xs text-muted-foreground">
                        Sample: {parsedData.rows[0]?.[header] || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Map to:</Label>
                      <Select
                        value={columnMapping[header]?.field || "skip"}
                        onValueChange={(value) => {
                          if (value === "skip") {
                            const newMapping = { ...columnMapping };
                            delete newMapping[header];
                            setColumnMapping(newMapping);
                          } else if (value === "title" || value === "content") {
                            updateMapping(header, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Skip</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedType && TV_OBJECT_SCHEMAS[selectedType] && (
                        <Select
                          value={columnMapping[header]?.attributeName || "none"}
                          onValueChange={(value) => {
                            if (value !== "none") {
                              updateMapping(header, "attribute", value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Or attribute..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No attribute</SelectItem>
                            {TV_OBJECT_SCHEMAS[selectedType].map(attr => (
                              <SelectItem key={attr.name} value={attr.name}>
                                {attr.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => {
                setParsedData(null);
                setFile(null);
                setColumnMapping({});
                setSelectedType(undefined);
              }}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !Object.keys(columnMapping).some(k => columnMapping[k].field === "title")}>
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {parsedData.rows.length} Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Result Section */}
        {importResult && (
          <Card className="p-8">
            <div className="text-center">
              {importResult.errors.length === 0 ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-bold mb-2">Import Successful!</h2>
                  <p className="text-muted-foreground mb-6">
                    Created {importResult.success} notes
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h2 className="text-2xl font-bold mb-2">Import Completed with Warnings</h2>
                  <p className="text-muted-foreground mb-4">
                    Created {importResult.success} notes, {importResult.errors.length} errors
                  </p>
                  <div className="text-left bg-accent/50 p-4 rounded max-h-48 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-500">{error}</div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={() => {
                  setParsedData(null);
                  setFile(null);
                  setColumnMapping({});
                  setSelectedType(undefined);
                  setImportResult(null);
                }}>
                  Import Another File
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/notes"}>
                  View Notes
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
