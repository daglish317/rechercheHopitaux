"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maladieAPI } from "@/lib/api";
import { FileUp, Download, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function ImportMaladiesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    created?: number;
    skipped?: number;
    error?: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setResult(null);
      } else {
        setResult({
          success: false,
          message: "",
          error: "Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await maladieAPI.importExcel(file);
      setResult({
        success: true,
        message: response.data.message,
        created: response.data.created,
        skipped: response.data.skipped,
      });
      setFile(null);
    } catch (error: any) {
      setResult({
        success: false,
        message: "",
        error: error.response?.data?.error || "Erreur lors de l'import",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Créer un template Excel simple
    const csvContent = "nom\nDiabète\nHypertension\nAsthme";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_maladies.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Importer des maladies</h1>
          <p className="text-gray-600 mt-2">
            Importez une liste de maladies depuis un fichier Excel ou CSV
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Le fichier doit contenir une colonne nommée "nom" ou "Nom"</li>
            <li>Formats acceptés : .xlsx, .xls, .csv</li>
            <li>Les doublons seront automatiquement ignorés</li>
            <li>Une ligne par maladie</li>
          </ul>
        </div>

        {/* Download Template */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Template</h3>
          <p className="text-sm text-gray-600 mb-4">
            Téléchargez un fichier template pour voir le format attendu
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" />
            Télécharger le template
          </button>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Importer le fichier</h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FileUp
              className={`w-12 h-12 mx-auto mb-4 ${
                dragActive ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <p className="text-gray-700 font-medium mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition">
              Parcourir
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {file && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Import en cours..." : "Lancer l'import"}
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg p-6 ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.success ? "Import réussi" : "Erreur d'import"}
                </h3>
                {result.success ? (
                  <div className="text-sm text-green-800 space-y-1">
                    <p>{result.message}</p>
                    <p>✓ {result.created} maladie(s) créée(s)</p>
                    <p>⊘ {result.skipped} maladie(s) ignorée(s) (doublons)</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-800">{result.error}</p>
                )}
                {result.success && (
                  <button
                    onClick={() => router.push("/admin/referentiels/maladies")}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    Voir la liste des maladies
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
