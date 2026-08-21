"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { examenAPI, ExamenMedical, hopitalExamenAPI, HopitalExamen } from "@/lib/examen";
import { hopitalAPI, Hopital } from "@/lib/hopital";
import { PlusIcon, EditIcon, TrashIcon, XIcon, AlertIcon } from "@/components/Icons";

type Tab = "catalogue" | "associations";

export default function ExamensMedicauxPage() {
  const [tab, setTab] = useState<Tab>("catalogue");

  const [examens, setExamens] = useState<ExamenMedical[]>([]);
  const [associations, setAssociations] = useState<HopitalExamen[]>([]);
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingExamen, setEditingExamen] = useState<ExamenMedical | null>(null);
  const [nom, setNom] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState<ExamenMedical | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showAssocForm, setShowAssocForm] = useState(false);
  const [assocHopital, setAssocHopital] = useState("");
  const [assocExamen, setAssocExamen] = useState("");
  const [assocFormError, setAssocFormError] = useState("");
  const [submittingAssoc, setSubmittingAssoc] = useState(false);

  const [deleteAssocModal, setDeleteAssocModal] = useState<HopitalExamen | null>(null);
  const [deletingAssoc, setDeletingAssoc] = useState(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [examensRes, associationsRes, hopitauxRes] = await Promise.all([
        examenAPI.getAll(),
        hopitalExamenAPI.getAll(),
        hopitalAPI.getAll(),
      ]);
      if (mountedRef.current) {
        setExamens(examensRes.data);
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
    setEditingExamen(null);
    setNom("");
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEdit = (examen: ExamenMedical) => {
    setEditingExamen(examen);
    setNom(examen.nom);
    setFormError("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExamen(null);
    setNom("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingExamen) {
        await examenAPI.update(editingExamen.id, { nom });
      } else {
        await examenAPI.create({ nom });
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
      await examenAPI.delete(deleteModal.id);
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
    setAssocExamen("");
    setAssocFormError("");
    setShowAssocForm(true);
  };

  const handleCloseAssocForm = () => {
    setShowAssocForm(false);
    setAssocHopital("");
    setAssocExamen("");
    setAssocFormError("");
  };

  const handleSubmitAssoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssocFormError("");
    setSubmittingAssoc(true);

    try {
      await hopitalExamenAPI.create({
        hopital: parseInt(assocHopital),
        examen: parseInt(assocExamen),
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
          } else if (data.examen) {
            message = Array.isArray(data.examen) ? data.examen[0] : String(data.examen);
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
      await hopitalExamenAPI.delete(deleteAssocModal.id);
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
      <div className="admin-dark-page space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Examens médicaux
          </h1>
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center py-12 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dark-page space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Examens médicaux
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Gestion des examens médicaux et leurs associations avec les hôpitaux
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Fermer"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-4 overflow-x-auto border-b border-slate-200 dark:border-slate-700 sm:gap-6">
        <button
          onClick={() => setTab("catalogue")}
          className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            tab === "catalogue"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
          }`}
        >
          Catalogue des examens ({examens.length})
        </button>
        <button
          onClick={() => setTab("associations")}
          className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            tab === "associations"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
          }`}
        >
          Associations hôpital-examen ({associations.length})
        </button>
      </div>

      {tab === "catalogue" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Liste des examens ({examens.length})
            </h2>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter un examen
            </button>
          </div>

          {examens.length === 0 ? (
            <div className="py-12 text-center text-slate-600 dark:text-slate-400">
              Aucun examen médical enregistré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                  {examens.map((examen) => (
                    <tr
                      key={examen.id}
                      className="transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                        {examen.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="inline-flex items-center gap-4">
                          <button
                            onClick={() => handleOpenEdit(examen)}
                            className="inline-flex items-center gap-1.5 font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <EditIcon className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => setDeleteModal(examen)}
                            className="inline-flex items-center gap-1.5 font-medium text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
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
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Associations ({associations.length})
            </h2>
            <button
              onClick={handleOpenAssocForm}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter une association
            </button>
          </div>

          {associations.length === 0 ? (
            <div className="py-12 text-center text-slate-600 dark:text-slate-400">
              Aucune association enregistrée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Hôpital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Examen médical
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                  {associations.map((assoc) => (
                    <tr
                      key={assoc.id}
                      className="transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                        {assoc.hopital_nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {assoc.examen_nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => setDeleteAssocModal(assoc)}
                          className="inline-flex items-center gap-1.5 font-medium text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70" aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingExamen ? "Modifier l'examen" : "Ajouter un examen"}
              </h3>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {formError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="nom" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  placeholder="Ex: IRM, Scanner..."
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !nom.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : editingExamen ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70" aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Confirmer la suppression
              </h3>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                  <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                  Êtes-vous sûr de vouloir supprimer l&apos;examen{" "}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    &laquo; {deleteModal.nom} &raquo;
                  </strong>{" "}
                  ?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button
                onClick={() => setDeleteModal(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssocForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70" aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ajouter une association
              </h3>
              <button
                type="button"
                onClick={handleCloseAssocForm}
                className="text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssoc} className="px-6 py-4">
              {assocFormError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{assocFormError}</span>
                </div>
              )}

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hôpital *
                </label>
                <select
                  value={assocHopital}
                  onChange={(e) => setAssocHopital(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Examen médical *
                </label>
                <select
                  value={assocExamen}
                  onChange={(e) => setAssocExamen(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                >
                  <option value="">Sélectionner un examen</option>
                  {examens.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAssocForm}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingAssoc || !assocHopital || !assocExamen}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingAssoc ? "Création..." : "Créer l'association"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteAssocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70" aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Confirmer la suppression
              </h3>
              <button
                type="button"
                onClick={() => setDeleteAssocModal(null)}
                className="text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                  <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                  Supprimer l&apos;association{" "}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    &laquo; {deleteAssocModal.hopital_nom} ↔ {deleteAssocModal.examen_nom} &raquo;
                  </strong>{" "}
                  ?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button
                onClick={() => setDeleteAssocModal(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAssoc}
                disabled={deletingAssoc}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {deletingAssoc ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
