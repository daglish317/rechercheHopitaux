"use client";

import { useState, useEffect, useRef, useCallback } from"react";
import { examenAPI, ExamenMedical, hopitalExamenAPI, HopitalExamen } from"@/lib/examen";
import { hopitalAPI, Hopital } from"@/lib/hopital";
import { PlusIcon, EditIcon, TrashIcon, XIcon, AlertIcon } from"@/components/Icons";

type Tab ="catalogue" |"associations";

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
 if (err && typeof err ==="object" &&"response" in err) {
 const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
 if (axiosError.response?.data) {
 const data = axiosError.response.data;
 const message = data.nom
 ? Array.isArray(data.nom)
 ? data.nom[0]
 : String(data.nom)
 :"Une erreur est survenue.";
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
 let message ="Erreur lors de la suppression.";
 if (err && typeof err ==="object" &&"response" in err) {
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
 if (err && typeof err ==="object" &&"response" in err) {
 const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
 if (axiosError.response?.data) {
 const data = axiosError.response.data;
 let message ="Une erreur est survenue.";
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
 <div>
 <h1 className="text-3xl font-bold text-slate-900 mb-8">Examens médicaux</h1>
 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center py-12 text-slate-600">
 Chargement...
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-slate-900">Examens médicaux</h1>
 <p className="mt-2 text-slate-600">
 Gestion des examens médicaux et leurs associations avec les hôpitaux
 </p>
 </div>

 {error && (
 <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
 <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
 <span className="flex-1">{error}</span>
 <button
 onClick={() => setError("")}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-4 h-4" />
 </button>
 </div>
 )}

 <div className="mb-6 flex gap-4 sm:gap-6 border-b border-slate-200 overflow-x-auto">
 <button
 onClick={() => setTab("catalogue")}
 className={`pb-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
 tab ==="catalogue"
 ?"border-blue-600 text-blue-600"
 :"border-transparent text-slate-500 hover:text-slate-700:text-slate-200"
 }`}
 >
 Catalogue des examens ({examens.length})
 </button>
 <button
 onClick={() => setTab("associations")}
 className={`pb-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
 tab ==="associations"
 ?"border-blue-600 text-blue-600"
 :"border-transparent text-slate-500 hover:text-slate-700:text-slate-200"
 }`}
 >
 Associations hôpital-examen ({associations.length})
 </button>
 </div>

 {tab ==="catalogue" && (
 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <h2 className="text-xl font-semibold text-slate-900">
 Liste des examens ({examens.length})
 </h2>
 <button
 onClick={handleOpenCreate}
 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:ring-offset-2 transition-colors"
 >
 <PlusIcon className="w-4 h-4" />
 Ajouter un examen
 </button>
 </div>

 {examens.length === 0 ? (
 <div className="text-center py-12 text-slate-600">
 Aucun examen médical enregistré.
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-slate-200">
 <thead className="bg-slate-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Nom
 </th>
 <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-slate-200">
 {examens.map((examen) => (
 <tr key={examen.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
 {examen.nom}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
 <div className="inline-flex items-center gap-4">
 <button
 onClick={() => handleOpenEdit(examen)}
 className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800:text-blue-300 font-medium transition-colors"
 >
 <EditIcon className="w-4 h-4" />
 Modifier
 </button>
 <button
 onClick={() => setDeleteModal(examen)}
 className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800:text-red-300 font-medium transition-colors"
 >
 <TrashIcon className="w-4 h-4" />
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

 {tab ==="associations" && (
 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <h2 className="text-xl font-semibold text-slate-900">
 Associations ({associations.length})
 </h2>
 <button
 onClick={handleOpenAssocForm}
 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:ring-offset-2 transition-colors"
 >
 <PlusIcon className="w-4 h-4" />
 Ajouter une association
 </button>
 </div>

 {associations.length === 0 ? (
 <div className="text-center py-12 text-slate-600">
 Aucune association enregistrée.
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-slate-200">
 <thead className="bg-slate-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Hôpital
 </th>
 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Examen médical
 </th>
 <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-slate-200">
 {associations.map((assoc) => (
 <tr key={assoc.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
 {assoc.hopital_nom}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
 {assoc.examen_nom}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
 <button
 onClick={() => setDeleteAssocModal(assoc)}
 className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800:text-red-300 font-medium transition-colors"
 >
 <TrashIcon className="w-4 h-4" />
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
 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" aria-hidden="true"></div>
 <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-semibold text-slate-900">
 {editingExamen ?"Modifier l'examen" :"Ajouter un examen"}
 </h3>
 <button
 type="button"
 onClick={handleCloseForm}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="px-6 py-4">
 {formError && (
 <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
 <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
 <span>{formError}</span>
 </div>
 )}

 <div className="mb-4">
 <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">
 Nom *
 </label>
 <input
 id="nom"
 type="text"
 value={nom}
 onChange={(e) => setNom(e.target.value)}
 required
 className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:border-blue-500:border-blue-400 transition-colors"
 placeholder="Ex: IRM, Scanner..."
 autoFocus
 />
 </div>

 <div className="flex justify-end gap-3 pt-2">
 <button
 type="button"
 onClick={handleCloseForm}
 className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
 >
 Annuler
 </button>
 <button
 type="submit"
 disabled={submitting || !nom.trim()}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {submitting
 ?"Enregistrement..."
 : editingExamen
 ?"Enregistrer"
 :"Créer"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {deleteModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" aria-hidden="true"></div>
 <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-semibold text-slate-900">
 Confirmer la suppression
 </h3>
 <button
 type="button"
 onClick={() => setDeleteModal(null)}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>
 <div className="px-6 py-4">
 <div className="flex items-start gap-3">
 <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
 <AlertIcon className="w-5 h-5 text-red-600" />
 </div>
 <p className="pt-2 text-sm text-slate-600">
 Êtes-vous sûr de vouloir supprimer l&apos;examen{""}
 <strong className="font-semibold text-slate-900">&laquo; {deleteModal.nom} &raquo;</strong> ?
 </p>
 </div>
 </div>
 <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
 <button
 onClick={() => setDeleteModal(null)}
 className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
 >
 Annuler
 </button>
 <button
 onClick={handleDelete}
 disabled={deleting}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <TrashIcon className="w-4 h-4" />
 {deleting ?"Suppression..." :"Supprimer"}
 </button>
 </div>
 </div>
 </div>
 )}

 {showAssocForm && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" aria-hidden="true"></div>
 <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-semibold text-slate-900">
 Ajouter une association
 </h3>
 <button
 type="button"
 onClick={handleCloseAssocForm}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSubmitAssoc} className="px-6 py-4">
 {assocFormError && (
 <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
 <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
 <span>{assocFormError}</span>
 </div>
 )}

 <div className="mb-4">
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Hôpital *
 </label>
 <select
 value={assocHopital}
 onChange={(e) => setAssocHopital(e.target.value)}
 required
 className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:border-blue-500:border-blue-400 transition-colors"
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
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Examen médical *
 </label>
 <select
 value={assocExamen}
 onChange={(e) => setAssocExamen(e.target.value)}
 required
 className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:border-blue-500:border-blue-400 transition-colors"
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
 className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
 >
 Annuler
 </button>
 <button
 type="submit"
 disabled={submittingAssoc || !assocHopital || !assocExamen}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {submittingAssoc ?"Création..." :"Créer l'association"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {deleteAssocModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" aria-hidden="true"></div>
 <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-semibold text-slate-900">
 Confirmer la suppression
 </h3>
 <button
 type="button"
 onClick={() => setDeleteAssocModal(null)}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>
 <div className="px-6 py-4">
 <div className="flex items-start gap-3">
 <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
 <AlertIcon className="w-5 h-5 text-red-600" />
 </div>
 <p className="pt-2 text-sm text-slate-600">
 Supprimer l&apos;association{""}
 <strong className="font-semibold text-slate-900">
 &laquo; {deleteAssocModal.hopital_nom} ↔ {deleteAssocModal.examen_nom} &raquo;
 </strong> ?
 </p>
 </div>
 </div>
 <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
 <button
 onClick={() => setDeleteAssocModal(null)}
 className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
 >
 Annuler
 </button>
 <button
 onClick={handleDeleteAssoc}
 disabled={deletingAssoc}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <TrashIcon className="w-4 h-4" />
 {deletingAssoc ?"Suppression..." :"Supprimer"}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

