"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { maladieAPI, Maladie } from "@/lib/maladie";

export default function MaladiesPage() {
  const [maladies, setMaladies] = useState<Maladie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMaladie, setEditingMaladie] = useState<Maladie | null>(null);
  const [nom, setNom] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState<Maladie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const mountedRef = useRef(true);

  const fetchMaladies = useCallback(async () => {
    try {
      const response = await maladieAPI.getAll();
      if (mountedRef.current) {
        setMaladies(response.data);
        setError("");
      }
    } catch {
      if (mountedRef.current) {
        setError("Erreur lors du chargement des maladies.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      await fetchMaladies();
    };
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchMaladies]);

  const handleOpenCreate = () => {
    setEditingMaladie(null);
    setNom("");
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEdit = (maladie: Maladie) => {
    setEditingMaladie(maladie);
    setNom(maladie.nom);
    setFormError("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaladie(null);
    setNom("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingMaladie) {
        await maladieAPI.update(editingMaladie.id, { nom });
      } else {
        await maladieAPI.create({ nom });
      }
      handleCloseForm();
      fetchMaladies();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          const message = data.nom
            ? Array.isArray(data.nom)
              ? data.nom[0]
              : String(data.nom)
            : "Une erreur est survenue.";
          setFormError(message);
        }
      } else {
        setFormError("Une erreur est survenue.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      await maladieAPI.delete(deleteModal.id);
      setDeleteModal(null);
      fetchMaladies();
    } catch (err: unknown) {
      let message = "Erreur lors de la suppression.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        }
      }
      setDeleteModal(null);
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Maladies</h1>
        <p className="mt-2 text-gray-600">
          Gestion du catalogue des maladies
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Liste des maladies ({maladies.length})
          </h2>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Ajouter une maladie
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement...
          </div>
        ) : maladies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune maladie enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maladies.map((maladie) => (
                  <tr key={maladie.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maladie.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <button
                        onClick={() => handleOpenEdit(maladie)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteModal(maladie)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMaladie ? "Modifier la maladie" : "Ajouter une maladie"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {formError && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="nom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Paludisme"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !nom.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingMaladie
                    ? "Enregistrer"
                    : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer la suppression
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer la maladie{" "}
                <strong>&laquo; {deleteModal.nom} &raquo;</strong> ?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
