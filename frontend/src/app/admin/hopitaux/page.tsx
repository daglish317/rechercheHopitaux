"use client";

import { useState, useEffect, useRef, useCallback } from"react";
import { hopitalAPI, Hopital, HopitalCreateData } from"@/lib/hopital";
import { typeHopitalAPI, TypeHopital } from"@/lib/typeHopital";
import {
 PlusIcon,
 EditIcon,
 ChevronLeftIcon,
 XIcon,
 CheckCircleIcon,
 AlertIcon,
 HospitalIcon,
 MapPinIcon,
 PhoneIcon,
} from"@/components/Icons";

type ViewMode ="list" |"create" |"edit" |"detail";

interface FormData {
 nom: string;
 type_hopital: string;
 adresse: string;
 telephone: string;
 latitude: string;
 longitude: string;
 statut:"ACTIF" |"INACTIF";
}

const initialFormData: FormData = {
 nom:"",
 type_hopital:"",
 adresse:"",
 telephone:"",
 latitude:"",
 longitude:"",
 statut:"ACTIF",
};

export default function HopitauxPage() {
 const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
 const [types, setTypes] = useState<TypeHopital[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const [view, setView] = useState<ViewMode>("list");
 const [selectedHopital, setSelectedHopital] = useState<Hopital | null>(null);
 const [formData, setFormData] = useState<FormData>(initialFormData);
 const [formErrors, setFormErrors] = useState<Record<string, string>>({});
 const [submitting, setSubmitting] = useState(false);

 const [statusModal, setStatusModal] = useState<{
 hopital: Hopital;
 action:"ACTIF" |"INACTIF";
 } | null>(null);
 const [toggling, setToggling] = useState(false);

 const mountedRef = useRef(true);

 const fetchData = useCallback(async () => {
 try {
 const [hopitauxRes, typesRes] = await Promise.all([
 hopitalAPI.getAll(),
 typeHopitalAPI.getAll(),
 ]);
 if (mountedRef.current) {
 setHopitaux(hopitauxRes.data);
 setTypes(typesRes.data);
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

 const handleViewList = () => {
 setView("list");
 setSelectedHopital(null);
 setFormData(initialFormData);
 setFormErrors({});
 };

 const handleViewCreate = () => {
 setView("create");
 setSelectedHopital(null);
 setFormData(initialFormData);
 setFormErrors({});
 };

 const handleViewEdit = (hopital: Hopital) => {
 setView("edit");
 setSelectedHopital(hopital);
 setFormData({
 nom: hopital.nom,
 type_hopital: String(hopital.type_hopital),
 adresse: hopital.adresse,
 telephone: hopital.telephone,
 latitude: hopital.latitude ??"",
 longitude: hopital.longitude ??"",
 statut: hopital.statut,
 });
 setFormErrors({});
 };

 const handleViewDetail = (hopital: Hopital) => {
 setView("detail");
 setSelectedHopital(hopital);
 };

 const validateForm = (): boolean => {
 const errors: Record<string, string> = {};

 if (!formData.nom.trim()) {
 errors.nom ="Le nom est obligatoire.";
 }
 if (!formData.type_hopital) {
 errors.type_hopital ="Le type est obligatoire.";
 }
 if (!formData.adresse.trim()) {
 errors.adresse ="L'adresse est obligatoire.";
 }
 if (formData.latitude) {
 const lat = parseFloat(formData.latitude);
 if (isNaN(lat) || lat < -90 || lat > 90) {
 errors.latitude ="La latitude doit être entre -90 et 90.";
 }
 }
 if (formData.longitude) {
 const lng = parseFloat(formData.longitude);
 if (isNaN(lng) || lng < -180 || lng > 180) {
 errors.longitude ="La longitude doit être entre -180 et 180.";
 }
 }
 if (!formData.statut) {
 errors.statut ="Le statut est obligatoire.";
 }

 setFormErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validateForm()) return;

 setSubmitting(true);
 const payload: HopitalCreateData = {
 nom: formData.nom.trim(),
 type_hopital: parseInt(formData.type_hopital),
 adresse: formData.adresse.trim(),
 telephone: formData.telephone.trim(),
 latitude: formData.latitude ? parseFloat(formData.latitude) : null,
 longitude: formData.longitude ? parseFloat(formData.longitude) : null,
 statut: formData.statut,
 };

 try {
 if (view ==="create") {
 await hopitalAPI.create(payload);
 } else if (view ==="edit" && selectedHopital) {
 await hopitalAPI.update(selectedHopital.id, payload);
 }
 handleViewList();
 fetchData();
 } catch (err: unknown) {
 if (err && typeof err ==="object" &&"response" in err) {
 const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
 if (axiosError.response?.data) {
 const apiErrors = axiosError.response.data;
 const newErrors: Record<string, string> = {};
 for (const [key, value] of Object.entries(apiErrors)) {
 newErrors[key] = Array.isArray(value) ? value[0] : String(value);
 }
 setFormErrors(newErrors);
 }
 } else {
 setFormErrors({ general:"Une erreur est survenue." });
 }
 } finally {
 setSubmitting(false);
 }
 };

 const handleToggleStatut = async () => {
 if (!statusModal) return;
 setToggling(true);

 try {
 await hopitalAPI.updateStatut(statusModal.hopital.id, statusModal.action);
 setStatusModal(null);
 fetchData();
 } catch {
 setError("Erreur lors de la mise à jour du statut.");
 setStatusModal(null);
 } finally {
 setToggling(false);
 }
 };

 const inputClassName = (hasError?: string) =>
 `w-full px-4 py-3 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40:ring-blue-400/40 focus:border-blue-500:border-blue-400 transition-colors ${
 hasError ?"border-red-500" :"border-slate-300"
 }`;

 if (loading) {
 return (
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Hôpitaux</h1>
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 py-12 flex flex-col items-center justify-center gap-3">
 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
 <span className="text-slate-700">Chargement...</span>
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hôpitaux</h1>
 <p className="mt-2 text-sm sm:text-base text-slate-600">
 Gestion des hôpitaux enregistrés
 </p>
 </div>

 {error && (
 <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-3">
 <span className="flex items-center gap-2">
 <AlertIcon className="w-5 h-5 shrink-0" />
 {error}
 </span>
 <button
 onClick={() => setError("")}
 className="shrink-0 text-red-500 hover:text-red-700 transition-colors"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>
 )}

 {view ==="list" && (
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 border-b border-slate-200">
 <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
 Liste des hôpitaux ({hopitaux.length})
 </h2>
 <button
 onClick={handleViewCreate}
 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
 >
 <PlusIcon className="w-4 h-4" />
 Ajouter un hôpital
 </button>
 </div>

 {hopitaux.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 px-4 text-slate-600">
 <HospitalIcon className="w-12 h-12 text-slate-300 mb-4" />
 Aucun hôpital enregistré.
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-slate-200">
 <thead className="bg-slate-50">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">Nom</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">Type</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider hidden md:table-cell">Adresse</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider hidden lg:table-cell">Téléphone</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">Statut</th>
 <th className="px-4 py-3 text-right text-xs font-semibold text-slate-800 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-slate-200">
 {hopitaux.map((h) => (
 <tr key={h.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3 text-sm text-slate-900 font-medium">{h.nom}</td>
 <td className="px-4 py-3 text-sm text-slate-700">{h.type_hopital_nom}</td>
 <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell max-w-xs truncate">{h.adresse}</td>
 <td className="px-4 py-3 text-sm text-slate-700 hidden lg:table-cell">
 {h.telephone ||"—"}
 </td>
 <td className="px-4 py-3 text-sm">
 <span
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
 h.statut ==="ACTIF"
 ?"bg-emerald-100 text-emerald-600"
 :"bg-red-100 text-red-600"
 }`}
 >
 <CheckCircleIcon className="w-3.5 h-3.5" />
 {h.statut}
 </span>
 </td>
 <td className="px-4 py-3 text-sm whitespace-nowrap">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => handleViewDetail(h)}
 title="Voir"
 className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50:bg-blue-500/10 rounded-md transition-colors"
 >
 Voir
 </button>
 <button
 onClick={() => handleViewEdit(h)}
 title="Modifier"
 className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100:bg-slate-700 rounded-md transition-colors"
 >
 <EditIcon className="w-4 h-4" />
 Modifier
 </button>
 <button
 onClick={() =>
 setStatusModal({
 hopital: h,
 action: h.statut ==="ACTIF" ?"INACTIF" :"ACTIF",
 })
 }
 className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
 h.statut ==="ACTIF"
 ?"text-red-600 hover:bg-red-50:bg-red-500/10"
 :"text-emerald-600 hover:bg-emerald-50:bg-emerald-500/10"
 }`}
 >
 {h.statut ==="ACTIF" ? (
 <>
 <XIcon className="w-4 h-4" />
 Désactiver
 </>
 ) : (
 <>
 <CheckCircleIcon className="w-4 h-4" />
 Activer
 </>
 )}
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

 {(view ==="create" || view ==="edit") && (
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
 {view ==="create" ?"Ajouter un hôpital" :"Modifier l&apos;hôpital"}
 </h2>
 <button
 onClick={handleViewList}
 className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600:text-blue-400 transition-colors"
 >
 <ChevronLeftIcon className="w-4 h-4" />
 Retour à la liste
 </button>
 </div>

 {formErrors.general && (
 <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
 <AlertIcon className="w-5 h-5 shrink-0" />
 {formErrors.general}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
 <div>
 <label htmlFor="nom" className="block text-sm font-semibold text-slate-800 mb-1.5">Nom *</label>
 <input
 id="nom"
 type="text"
 value={formData.nom}
 onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
 className={inputClassName(formErrors.nom)}
 placeholder="Nom de l'hôpital"
 />
 {formErrors.nom && (
 <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
 <AlertIcon className="w-4 h-4" />
 {formErrors.nom}
 </p>
 )}
 </div>

 <div>
 <label htmlFor="type_hopital" className="block text-sm font-semibold text-slate-800 mb-1.5">Type d&apos;hôpital *</label>
 <select
 id="type_hopital"
 value={formData.type_hopital}
 onChange={(e) => setFormData({ ...formData, type_hopital: e.target.value })}
 className={inputClassName(formErrors.type_hopital)}
 >
 <option value="">Sélectionner un type</option>
 {types.map((t) => (
 <option key={t.id} value={t.id}>
 {t.nom}
 </option>
 ))}
 </select>
 {formErrors.type_hopital && (
 <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
 <AlertIcon className="w-4 h-4" />
 {formErrors.type_hopital}
 </p>
 )}
 </div>

 <div>
 <label htmlFor="adresse" className="block text-sm font-semibold text-slate-800 mb-1.5">Adresse *</label>
 <input
 id="adresse"
 type="text"
 value={formData.adresse}
 onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
 className={inputClassName(formErrors.adresse)}
 placeholder="Adresse complète"
 />
 {formErrors.adresse && (
 <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
 <AlertIcon className="w-4 h-4" />
 {formErrors.adresse}
 </p>
 )}
 </div>

 <div>
 <label htmlFor="telephone" className="block text-sm font-semibold text-slate-800 mb-1.5">Téléphone</label>
 <input
 id="telephone"
 type="text"
 value={formData.telephone}
 onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
 className={inputClassName()}
 placeholder="Numéro de téléphone (optionnel)"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
 <div>
 <label htmlFor="latitude" className="block text-sm font-semibold text-slate-800 mb-1.5">Latitude</label>
 <input
 id="latitude"
 type="number"
 step="0.000001"
 value={formData.latitude}
 onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
 className={inputClassName(formErrors.latitude)}
 placeholder="-90 à 90"
 />
 {formErrors.latitude && (
 <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
 <AlertIcon className="w-4 h-4" />
 {formErrors.latitude}
 </p>
 )}
 </div>
 <div>
 <label htmlFor="longitude" className="block text-sm font-semibold text-slate-800 mb-1.5">Longitude</label>
 <input
 id="longitude"
 type="number"
 step="0.000001"
 value={formData.longitude}
 onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
 className={inputClassName(formErrors.longitude)}
 placeholder="-180 à 180"
 />
 {formErrors.longitude && (
 <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
 <AlertIcon className="w-4 h-4" />
 {formErrors.longitude}
 </p>
 )}
 </div>
 </div>

 <div>
 <label htmlFor="statut" className="block text-sm font-semibold text-slate-800 mb-1.5">Statut *</label>
 <select
 id="statut"
 value={formData.statut}
 onChange={(e) =>
 setFormData({ ...formData, statut: e.target.value as"ACTIF" |"INACTIF" })
 }
 className={inputClassName()}
 >
 <option value="ACTIF">ACTIF</option>
 <option value="INACTIF">INACTIF</option>
 </select>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 pt-4">
 <button
 type="submit"
 disabled={submitting}
 className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {submitting ?"Enregistrement..." : view ==="create" ?"Créer" :"Enregistrer"}
 </button>
 <button
 type="button"
 onClick={handleViewList}
 className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
 >
 Annuler
 </button>
 </div>
 </form>
 </div>
 )}

 {view ==="detail" && selectedHopital && (
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
 Fiche de l&apos;hôpital
 </h2>
 <div className="flex flex-wrap gap-3">
 <button
 onClick={() => handleViewEdit(selectedHopital)}
 className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
 >
 <EditIcon className="w-4 h-4" />
 Modifier
 </button>
 <button
 onClick={handleViewList}
 className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
 >
 <ChevronLeftIcon className="w-4 h-4" />
 Retour à la liste
 </button>
 </div>
 </div>

 <div className="flex items-start gap-4 pb-6 mb-6 border-b border-slate-200">
 <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 shrink-0">
 <HospitalIcon className="w-6 h-6 text-blue-600" />
 </div>
 <div>
 <p className="text-xl font-bold text-slate-900">{selectedHopital.nom}</p>
 <p className="text-sm text-slate-600 mt-0.5">{selectedHopital.type_hopital_nom}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex items-start gap-3">
 <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
 <div>
 <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Adresse</h3>
 <p className="text-slate-900">{selectedHopital.adresse}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <PhoneIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
 <div>
 <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Téléphone</h3>
 <p className="text-slate-900">{selectedHopital.telephone ||"Non renseigné"}</p>
 </div>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Latitude</h3>
 <p className="text-slate-900">{selectedHopital.latitude}</p>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Longitude</h3>
 <p className="text-slate-900">{selectedHopital.longitude}</p>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Statut</h3>
 <span
 className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
 selectedHopital.statut ==="ACTIF"
 ?"bg-emerald-100 text-emerald-600"
 :"bg-red-100 text-red-600"
 }`}
 >
 {selectedHopital.statut ==="ACTIF" ? (
 <CheckCircleIcon className="w-3.5 h-3.5" />
 ) : (
 <XIcon className="w-3.5 h-3.5" />
 )}
 {selectedHopital.statut}
 </span>
 </div>
 </div>
 </div>
 )}

 {statusModal && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/70 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
 role="dialog"
 aria-modal="true"
 >
 <div className="absolute inset-0" onClick={() => !toggling && setStatusModal(null)}></div>
 <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-[scaleIn_150ms_ease-out]">
 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <h3 className="text-lg font-semibold text-slate-900">
 {statusModal.action ==="ACTIF" ?"Activer" :"Désactiver"} l&apos;hôpital
 </h3>
 <button
 onClick={() => setStatusModal(null)}
 disabled={toggling}
 className="text-slate-600 hover:text-slate-800:text-slate-200 transition-colors disabled:opacity-50"
 aria-label="Fermer"
 >
 <XIcon className="w-5 h-5" />
 </button>
 </div>
 <div className="px-6 py-5 flex items-start gap-3">
 {statusModal.action ==="ACTIF" ? (
 <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
 ) : (
 <AlertIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
 )}
 <p className="text-slate-700">
 {statusModal.action ==="ACTIF"
 ? `Voulez-vous activer l'hôpital « ${statusModal.hopital.nom} » ?`
 : `Voulez-vous désactiver l'hôpital « ${statusModal.hopital.nom} » ?`}
 </p>
 </div>
 <div className="px-6 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
 <button
 onClick={() => setStatusModal(null)}
 disabled={toggling}
 className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
 >
 Annuler
 </button>
 <button
 onClick={handleToggleStatut}
 disabled={toggling}
 className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
 statusModal.action ==="ACTIF"
 ?"bg-emerald-600 hover:bg-emerald-700"
 :"bg-red-600 hover:bg-red-700"
 }`}
 >
 {toggling ? (
 <>
 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
 En cours...
 </>
 ) : statusModal.action ==="ACTIF" ? (
 <>
 <CheckCircleIcon className="w-4 h-4" />
 Activer
 </>
 ) : (
 <>
 <XIcon className="w-4 h-4" />
 Désactiver
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}


