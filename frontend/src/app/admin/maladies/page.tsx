"use client";

import { useState, useEffect, useRef, useCallback } from"react";
import { maladieAPI, Maladie } from"@/lib/maladie";
import { PlusIcon, EditIcon, TrashIcon, XIcon, AlertIcon } from"@/components/Icons";

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
 await maladieAPI.delete(deleteModal.id);
 setDeleteModal(null);
 fetchMaladies();
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

 return (
 <div>
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-slate-900">Maladies</h1>
 <p className="mt-2 text-slate-600">
 Gestion du catalogue des maladies
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

 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <h2 className="text-xl font-semibold text-slate-900">
 Liste des maladies ({maladies.length})
 </h2>
 <button
 onClick={handleOpenCreate}
 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:ring-offset-2 transition-colors"
 >
 <PlusIcon className="w-4 h-4" />
 Ajouter une maladie
 </button>
 </div>

 {loading ? (
 <div className="text-center py-12 text-slate-600">
 Chargement...
 </div>
 ) : maladies.length === 0 ? (
 <div className="text-center py-12 text-slate-600">
 Aucune maladie enregistrée.
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
 {maladies.map((maladie) => (
 <tr key={maladie.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
 {maladie.nom}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
 <div className="inline-flex items-center gap-4">
 <button
 onClick={() => handleOpenEdit(maladie)}
 className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800:text-blue-300 font-medium transition-colors"
 >
 <EditIcon className="w-4 h-4" />
 Modifier
 </button>
 <button
 onClick={() => setDeleteModal(maladie)}
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

 {showForm && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" aria-hidden="true"></div>
 <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-semibold text-slate-900">
 {editingMaladie ?"Modifier la maladie" :"Ajouter une maladie"}
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
 <label
 htmlFor="nom"
 className="block text-sm font-medium text-slate-700 mb-1"
 >
 Nom *
 </label>
 <input
 id="nom"
 type="text"
 value={nom}
 onChange={(e) => setNom(e.target.value)}
 required
 className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400 focus:border-blue-500:border-blue-400 transition-colors"
 placeholder="Ex: Paludisme"
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
 : editingMaladie
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
 Êtes-vous sûr de vouloir supprimer la maladie{""}
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
 </div>
 );
}


