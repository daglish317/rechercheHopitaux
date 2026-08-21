"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  plateauTechniqueAPI,
  PlateauTechnique,
  hopitalPlateauTechniqueAPI,
  HopitalPlateauTechnique,
} from "@/lib/plateauTechnique";
import { hopitalAPI, Hopital } from "@/lib/hopital";

type Tab = "catalogue" | "associations";

export default function PlateauTechniquePage() {
  const [tab, setTab] = useState<Tab>("catalogue");

  const [plateaux, setPlateaux] = useState<PlateauTechnique[]>([]);
  const [associations, setAssociations] = useState<HopitalPlateauTechnique[]>([]);
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PlateauTechnique | null>(null);
  const [nom, setNom] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState<PlateauTechnique | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showAssocForm, setShowAssocForm] = useState(false);
  const [assocHopital, setAssocHopital] = useState("");
  const [assocPlateau, setAssocPlateau] = useState("");
  const [assocFormError, setAssocFormError] = useState("");
  const [submittingAssoc, setSubmittingAssoc] = useState(false);

  const [deleteAssocModal, setDeleteAssocModal] = useState<HopitalPlateauTechnique | null>(null);
  const [deletingAssoc, setDeletingAssoc] = useState(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [plateauxRes, associationsRes, hopitauxRes] = await Promise.all([
        plateauTechniqueAPI.getAll(),
        hopitalPlateauTechniqueAPI.getAll(),
        hopitalAPI.getAll(),
      ]);
      if (mountedRef.current) {
        setPlateaux(plateauxRes.data);
        setAssociations(associationsRes.data);
        setHopitaux(hopitauxRes.data);
        setError("");
      }
    } catch {
      if (mountedRef.current) {
        setError("Erreur lors du chargement des données.");
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
      await fetchData();
    };
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNom("");
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEdit = (item: PlateauTechnique) => {
    setEditingItem(item);
    setNom(item.nom);
    setFormError("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setNom("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingItem) {
        await plateauTechniqueAPI.update(editingItem.id, { nom });
      } else {
        await plateauTechniqueAPI.create({ nom });
      }
      handleCloseForm();
      fetchData();
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
      await plateauTechniqueAPI.delete(deleteModal.id);
      setDeleteModal(null);
      fetchData();
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

  const handleOpenAssocForm = () => {
    setAssocHopital("");
    setAssocPlateau("");
    setAssocFormError("");
    setShowAssocForm(true);
  };

  const handleCloseAssocForm = () => {
    setShowAssocForm(false);
    setAssocHopital("");
    setAssocPlateau("");
    setAssocFormError("");
  };

  const handleSubmitAssoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssocFormError("");
    setSubmittingAssoc(true);

    try {
      await hopitalPlateauTechniqueAPI.create({
        hopital: parseInt(assocHopital),
        plateau_technique: parseInt(assocPlateau),
      });
      handleCloseAssocForm();
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          let message = "Une erreur est survenue.";
          if (data.non_field_errors) {
            message = Array.isArray(data.non_field_errors)
              ? data.non_field_errors[0]
              : String(data.non_field_errors);
          } else if (data.hopital) {
            message = Array.isArray(data.hopital) ? data.hopital[0] : String(data.hopital);
          } else if (data.plateau_technique) {
            message = Array.isArray(data.plateau_technique)
              ? data.plateau_technique[0]
              : String(data.plateau_technique);
          }
          setAssocFormError(message);
        }
      } else {
        setAssocFormError("Une erreur est survenue.");
      }
    } finally {
      setSubmittingAssoc(false);
    }
  };

  const handleDeleteAssoc = async () => {
    if (!deleteAssocModal) return;
    setDeletingAssoc(true);

    try {
      await hopitalPlateauTechniqueAPI.delete(deleteAssocModal.id);
      setDeleteAssocModal(null);
      fetchData();
    } catch {
      setError("Erreur lors de la suppression de l'association.");
      setDeleteAssocModal(null);
    } finally {
      setDeletingAssoc(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Plateau technique</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12 text-gray-500">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plateau technique</h1>
        <p className="mt-2 text-gray-600">
          Gestion du plateau technique et de ses associations avec les hôpitaux
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">
            ×
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab("catalogue")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === "catalogue"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Catalogue ({plateaux.length})
        </button>
        <button
          onClick={() => setTab("associations")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === "associations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Associations hôpital-plateau ({associations.length})
        </button>
      </div>

      {tab === "catalogue" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des éléments ({plateaux.length})
            </h2>
            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Ajouter un élément
            </button>
          </div>

          {plateaux.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun élément de plateau technique enregistré.
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
                  {plateaux.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteModal(item)}
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
      )}

      {tab === "associations" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Associations ({associations.length})
            </h2>
            <button
              onClick={handleOpenAssocForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Ajouter une association
            </button>
          </div>

          {associations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune association enregistrée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hôpital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plateau technique
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {associations.map((assoc) => (
                    <tr key={assoc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assoc.hopital_nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assoc.plateau_technique_nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => setDeleteAssocModal(assoc)}
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
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? "Modifier l&apos;élément" : "Ajouter un élément"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {formError && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Scanner, IRM, Échographe..."
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
                    : editingItem
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
                Êtes-vous sûr de vouloir supprimer l&apos;élément{" "}
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

      {showAssocForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter une association
              </h3>
            </div>

            <form onSubmit={handleSubmitAssoc} className="px-6 py-4">
              {assocFormError && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {assocFormError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hôpital *
                </label>
                <select
                  value={assocHopital}
                  onChange={(e) => setAssocHopital(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un hôpital</option>
                  {hopitaux.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Élément du plateau technique *
                </label>
                <select
                  value={assocPlateau}
                  onChange={(e) => setAssocPlateau(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un élément</option>
                  {plateaux.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAssocForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingAssoc || !assocHopital || !assocPlateau}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submittingAssoc ? "Création..." : "Créer l'association"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteAssocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer la suppression
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Supprimer l&apos;association{" "}
                <strong>
                  &laquo; {deleteAssocModal.hopital_nom} ↔ {deleteAssocModal.plateau_technique_nom} &raquo;
                </strong> ?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteAssocModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAssoc}
                disabled={deletingAssoc}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingAssoc ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
