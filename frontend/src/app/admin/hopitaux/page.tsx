"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { hopitalAPI, Hopital, HopitalCreateData } from "@/lib/hopital";
import { typeHopitalAPI, TypeHopital } from "@/lib/typeHopital";

type ViewMode = "list" | "create" | "edit" | "detail";

interface FormData {
  nom: string;
  type_hopital: string;
  adresse: string;
  telephone: string;
  latitude: string;
  longitude: string;
  statut: "ACTIF" | "INACTIF";
}

const initialFormData: FormData = {
  nom: "",
  type_hopital: "",
  adresse: "",
  telephone: "",
  latitude: "",
  longitude: "",
  statut: "ACTIF",
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
    action: "ACTIF" | "INACTIF";
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
      latitude: hopital.latitude,
      longitude: hopital.longitude,
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
      errors.nom = "Le nom est obligatoire.";
    }
    if (!formData.type_hopital) {
      errors.type_hopital = "Le type est obligatoire.";
    }
    if (!formData.adresse.trim()) {
      errors.adresse = "L'adresse est obligatoire.";
    }
    if (!formData.latitude) {
      errors.latitude = "La latitude est obligatoire.";
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "La latitude doit être entre -90 et 90.";
      }
    }
    if (!formData.longitude) {
      errors.longitude = "La longitude est obligatoire.";
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "La longitude doit être entre -180 et 180.";
      }
    }
    if (!formData.statut) {
      errors.statut = "Le statut est obligatoire.";
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
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      statut: formData.statut,
    };

    try {
      if (view === "create") {
        await hopitalAPI.create(payload);
      } else if (view === "edit" && selectedHopital) {
        await hopitalAPI.update(selectedHopital.id, payload);
      }
      handleViewList();
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
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
        setFormErrors({ general: "Une erreur est survenue." });
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

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hôpitaux</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12 text-gray-500">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hôpitaux</h1>
        <p className="mt-2 text-gray-600">
          Gestion des hôpitaux enregistrés
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

      {view === "list" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des hôpitaux ({hopitaux.length})
            </h2>
            <button
              onClick={handleViewCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Ajouter un hôpital
            </button>
          </div>

          {hopitaux.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun hôpital enregistré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hopitaux.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{h.nom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{h.type_hopital_nom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{h.adresse}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {h.telephone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            h.statut === "ACTIF"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {h.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <button
                          onClick={() => handleViewDetail(h)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleViewEdit(h)}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() =>
                            setStatusModal({
                              hopital: h,
                              action: h.statut === "ACTIF" ? "INACTIF" : "ACTIF",
                            })
                          }
                          className={`font-medium ${
                            h.statut === "ACTIF"
                              ? "text-orange-600 hover:text-orange-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {h.statut === "ACTIF" ? "Désactiver" : "Activer"}
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

      {(view === "create" || view === "edit") && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {view === "create" ? "Ajouter un hôpital" : "Modifier l&apos;hôpital"}
            </h2>
            <button
              onClick={handleViewList}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Retour à la liste
            </button>
          </div>

          {formErrors.general && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {formErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.nom ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nom de l'hôpital"
              />
              {formErrors.nom && <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;hôpital *</label>
              <select
                value={formData.type_hopital}
                onChange={(e) => setFormData({ ...formData, type_hopital: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.type_hopital ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionner un type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom}
                  </option>
                ))}
              </select>
              {formErrors.type_hopital && (
                <p className="mt-1 text-sm text-red-600">{formErrors.type_hopital}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.adresse ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Adresse complète"
              />
              {formErrors.adresse && (
                <p className="mt-1 text-sm text-red-600">{formErrors.adresse}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro de téléphone (optionnel)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.latitude ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="-90 à 90"
                />
                {formErrors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.latitude}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.longitude ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="-180 à 180"
                />
                {formErrors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.longitude}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
              <select
                value={formData.statut}
                onChange={(e) =>
                  setFormData({ ...formData, statut: e.target.value as "ACTIF" | "INACTIF" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIF">ACTIF</option>
                <option value="INACTIF">INACTIF</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Enregistrement..." : view === "create" ? "Créer" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={handleViewList}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "detail" && selectedHopital && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Fiche de l&apos;hôpital
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleViewEdit(selectedHopital)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Modifier
              </button>
              <button
                onClick={handleViewList}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Retour à la liste
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nom</h3>
              <p className="text-gray-900">{selectedHopital.nom}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type d&apos;hôpital</h3>
              <p className="text-gray-900">{selectedHopital.type_hopital_nom}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse</h3>
              <p className="text-gray-900">{selectedHopital.adresse}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h3>
              <p className="text-gray-900">{selectedHopital.telephone || "Non renseigné"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Latitude</h3>
              <p className="text-gray-900">{selectedHopital.latitude}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Longitude</h3>
              <p className="text-gray-900">{selectedHopital.longitude}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedHopital.statut === "ACTIF"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedHopital.statut}
              </span>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {statusModal.action === "ACTIF" ? "Activer" : "Désactiver"} l&apos;hôpital
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {statusModal.action === "ACTIF"
                  ? `Voulez-vous activer l'hôpital « ${statusModal.hopital.nom} » ?`
                  : `Voulez-vous désactiver l'hôpital « ${statusModal.hopital.nom} » ?`}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setStatusModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleStatut}
                disabled={toggling}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
                  statusModal.action === "ACTIF"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {toggling
                  ? "En cours..."
                  : statusModal.action === "ACTIF"
                  ? "Activer"
                  : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
