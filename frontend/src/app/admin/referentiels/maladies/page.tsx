"use client";

import { useState, useEffect } from "react";
import { maladieAPI, Maladie } from "@/lib/maladie";
import { PlusIcon, XIcon, AlertIcon, UploadIcon } from "@/components/Icons";

export default function ReferentielMaladiesPage() {
  const [maladies, setMaladies] = useState<Maladie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadMaladies();
  }, []);

  const loadMaladies = async () => {
    try {
      setLoading(true);
      const response = await maladieAPI.getAll();
      setMaladies(response.data);
    } catch {
      setError("Erreur lors du chargement des maladies");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await maladieAPI.create({ nom: newName.trim() });
      setSuccess("Maladie ajoutée avec succès");
      setNewName("");
      setShowForm(false);
      loadMaladies();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Cette maladie existe déjà");
      } else {
        setError("Erreur lors de l'ajout");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette maladie ?")) return;

    try {
      await maladieAPI.delete(id);
      setSuccess("Maladie supprimée");
      loadMaladies();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  const handleImport = () => {
    // TODO: Implémenter import Excel
    alert("Fonctionnalité d'import à venir");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Référentiel - Maladies
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Gérez la liste des maladies disponibles dans le système
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}>
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-lg">
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess("")}>
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Liste des maladies ({maladies.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <UploadIcon className="w-4 h-4" />
                Importer Excel
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <form onSubmit={handleAdd} className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la maladie"
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {saving ? "..." : "Ajouter"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewName("");
                }}
                className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </form>
          </div>
        )}

        <div className="p-6">
          {maladies.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Aucune maladie dans le référentiel
            </div>
          ) : (
            <div className="space-y-2">
              {maladies.map((maladie) => (
                <div
                  key={maladie.id}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {maladie.nom}
                  </span>
                  <button
                    onClick={() => handleDelete(maladie.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Supprimer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
