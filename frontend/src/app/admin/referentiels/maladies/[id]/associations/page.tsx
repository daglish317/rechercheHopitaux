"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { maladieAPI, Maladie, Hopital } from "@/lib/api";
import api from "@/lib/api";
import {
  Search,
  ArrowLeft,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Save,
} from "lucide-react";

interface HopitalWithAssociation extends Hopital {
  is_associated: boolean;
}

export default function MaladieAssociationsPage() {
  const router = useRouter();
  const params = useParams();
  const maladieId = parseInt(params.id as string);

  const [maladie, setMaladie] = useState<Maladie | null>(null);
  const [hopitaux, setHopitaux] = useState<HopitalWithAssociation[]>([]);
  const [filteredHopitaux, setFilteredHopitaux] = useState<HopitalWithAssociation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [maladieId]);

  useEffect(() => {
    const filtered = hopitaux.filter(
      (h) =>
        h.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.adresse.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHopitaux(filtered);
  }, [searchTerm, hopitaux]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger la maladie
      const maladieRes = await maladieAPI.getOne(maladieId);
      setMaladie(maladieRes.data);

      // Charger tous les hôpitaux
      const hopitauxRes = await api.get("/hopitaux/", {
        params: { page_size: 1000 },
      });
      const allHopitaux = hopitauxRes.data.results;

      // Charger les associations existantes pour cette maladie
      const associationsRes = await api.get(
        `/maladies/associations/maladie/${maladieId}/`
      );
      const associatedHopitalIds = associationsRes.data.hopitaux.map(
        (assoc: any) => assoc.hopital
      );

      // Marquer les hôpitaux associés
      const hopitauxWithStatus: HopitalWithAssociation[] = allHopitaux.map(
        (h: Hopital) => ({
          ...h,
          is_associated: associatedHopitalIds.includes(h.id),
        })
      );

      setHopitaux(hopitauxWithStatus);
      setFilteredHopitaux(hopitauxWithStatus);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      alert("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      setSaving(true);
      await maladieAPI.associateHopitaux(maladieId, {
        hopital_ids: selectedIds,
        action: "add",
      });
      setSelectedIds([]);
      loadData();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Erreur lors de l'ajout des associations");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Retirer ${selectedIds.length} hôpital(x) de cette maladie ?`))
      return;

    try {
      setSaving(true);
      await maladieAPI.associateHopitaux(maladieId, {
        hopital_ids: selectedIds,
        action: "remove",
      });
      setSelectedIds([]);
      loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression des associations");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredHopitaux.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredHopitaux.map((h) => h.id));
    }
  };

  const associatedCount = hopitaux.filter((h) => h.is_associated).length;
  const selectedAssociated = selectedIds.filter((id) =>
    hopitaux.find((h) => h.id === id && h.is_associated)
  ).length;
  const selectedNotAssociated = selectedIds.length - selectedAssociated;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Associations - {maladie?.nom}
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les hôpitaux associés à cette maladie
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un hôpital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {selectedNotAssociated > 0 && (
                <button
                  onClick={handleAddSelected}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter ({selectedNotAssociated})
                </button>
              )}
              {selectedAssociated > 0 && (
                <button
                  onClick={handleRemoveSelected}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Retirer ({selectedAssociated})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total hôpitaux</div>
            <div className="text-2xl font-bold text-gray-900">{hopitaux.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Associés</div>
            <div className="text-2xl font-bold text-green-600">{associatedCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Affichés</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredHopitaux.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Sélectionnés</div>
            <div className="text-2xl font-bold text-blue-600">{selectedIds.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {selectedIds.length === filteredHopitaux.length &&
                      filteredHopitaux.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hôpital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHopitaux.map((hopital) => (
                  <tr
                    key={hopital.id}
                    className={`hover:bg-gray-50 ${
                      hopital.is_associated ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelection(hopital.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {selectedIds.includes(hopital.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {hopital.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hopital.adresse}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hopital.type_hopital?.nom || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hopital.is_associated ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Associé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Non associé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHopitaux.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun hôpital disponible"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
