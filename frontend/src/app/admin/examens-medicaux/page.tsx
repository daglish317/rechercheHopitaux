"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  examenAPI,
  ExamenMedical,
  HopitalLight,
  HopitalExamens,
} from "@/lib/examen";
import {
  SearchIcon,
  ChevronLeftIcon,
  PlusIcon,
  XIcon,
  AlertIcon,
  UploadIcon,
  DownloadIcon,
} from "@/components/Icons";

type ViewMode = "list" | "manage" | "detail";

interface PendingItem {
  id?: number;
  nom: string;
  isNew: boolean;
  tempId: string;
  isChecked?: boolean;
}

export default function ExamensMedicauxPage() {
  const [view, setView] = useState<ViewMode>("list");

  const [hopitaux, setHopitaux] = useState<HopitalLight[]>([]);
  const [hopitauxLoading, setHopitauxLoading] = useState(true);
  const [hopitauxError, setHopitauxError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPageFetchRef = useRef(false);

  const [selectedHopital, setSelectedHopital] = useState<HopitalLight | null>(null);

  const [allExamens, setAllExamens] = useState<ExamenMedical[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [associationsLoading, setAssociationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [detailData, setDetailData] = useState<HopitalExamens | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchHopitaux = useCallback(async (q: string, p: number) => {
    setHopitauxLoading(true);
    setHopitauxError("");
    try {
      const response = await examenAPI.getHopitaux({ search: q, page: p, page_size: 20 });
      if (mountedRef.current) {
        setHopitaux(response.data.results);
        setTotalPages(response.data.total_pages);
      }
    } catch {
      if (mountedRef.current) setHopitauxError("Erreur lors du chargement des hôpitaux.");
    } finally {
      if (mountedRef.current) setHopitauxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipNextPageFetchRef.current) {
      skipNextPageFetchRef.current = false;
      return;
    }
    fetchHopitaux(search, page);
  }, [fetchHopitaux, page, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (page !== 1) {
      skipNextPageFetchRef.current = true;
      setPage(1);
    }
    debounceRef.current = setTimeout(() => fetchHopitaux(value, 1), 300);
  };

  const fetchExamensCatalogue = useCallback(async () => {
    try {
      const response = await examenAPI.getAll();
      if (mountedRef.current) setAllExamens(response.data);
    } catch { /* silent */ }
  }, []);

  const handleOpenManage = async (hopital: HopitalLight) => {
    setSelectedHopital(hopital);
    setAssociationsLoading(true);
    setSaveSuccess(false);
    setSaveError("");
    setView("manage");
    
    try {
      const [assocRes, catalogueRes] = await Promise.all([
        examenAPI.getAssociations(hopital.id),
        examenAPI.getAll(),
      ]);
      
      if (mountedRef.current) {
        setAllExamens(catalogueRes.data);
        const existingIds = assocRes.data.examens.map((a: any) => a.examen);
        
        // Créer la liste avec l'état coché/non coché
        const items: PendingItem[] = catalogueRes.data.map((examen: ExamenMedical) => ({
          id: examen.id,
          nom: examen.nom,
          isNew: false,
          tempId: `examen-${examen.id}`,
          isChecked: existingIds.includes(examen.id),
        }));
        setPendingItems(items);
      }
    } catch {
      if (mountedRef.current) setSaveError("Erreur lors du chargement des associations.");
    } finally {
      if (mountedRef.current) setAssociationsLoading(false);
    }
  };

  const handleOpenDetail = async (hopital: HopitalLight) => {
    setSelectedHopital(hopital);
    setDetailLoading(true);
    setDetailError("");
    setView("detail");
    try {
      const response = await examenAPI.getAssociations(hopital.id);
      if (mountedRef.current) setDetailData(response.data);
    } catch {
      if (mountedRef.current) setDetailError("Erreur lors du chargement des données.");
    } finally {
      if (mountedRef.current) setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setView("list");
    setSelectedHopital(null);
    setPendingItems([]);
    setDetailData(null);
    setSaveSuccess(false);
    setSaveError("");
  };

  const handleAddItem = () => {
    const newItem: PendingItem = {
      nom: "",
      isNew: true,
      tempId: `new-${Date.now()}`,
    };
    setPendingItems([...pendingItems, newItem]);
  };

  const handleRemoveItem = (tempId: string) => {
    setPendingItems(pendingItems.filter((item) => item.tempId !== tempId));
  };

  const handleItemChange = (tempId: string, value: string) => {
    setPendingItems(pendingItems.map((item) => 
      item.tempId === tempId ? { ...item, nom: value.trim() } : item
    ));
  };

  const handleToggleCheckbox = (tempId: string) => {
    setPendingItems(pendingItems.map((item) => 
      item.tempId === tempId ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleSave = async () => {
    if (!selectedHopital) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    
    try {
      const selectedIds = pendingItems
        .filter(item => item.isChecked && item.id)
        .map(item => item.id!);

      await examenAPI.bulkSetAssociations(selectedHopital.id, selectedIds);
      
      if (mountedRef.current) {
        setSaveSuccess(true);
        // Recharger pour avoir les données à jour
        const res = await examenAPI.getAssociations(selectedHopital.id);
        if (mountedRef.current) {
          setDetailData(res.data);
        }
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        let message = "Erreur lors de l'enregistrement.";
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as { response?: { data?: any } };
          if (axiosErr.response?.data) {
            const data = axiosErr.response.data;
            if (typeof data === 'object') {
              message = Object.values(data).flat().join(' ') || message;
            }
          }
        }
        setSaveError(message);
      }
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedHopital) return;
    try {
      const response = await examenAPI.exportExcel(selectedHopital.id);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `examens_${selectedHopital.nom.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setSaveError("Erreur lors de l'export Excel.");
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          const dataRows = rows.slice(1);
          
          const examenNames = dataRows
            .map(row => row[1])
            .filter(name => name && typeof name === 'string' && name.trim())
            .map(name => String(name).trim());
          
          const uniqueNames = Array.from(new Set(examenNames));
          
          const newItems: PendingItem[] = uniqueNames.map(nom => ({
            nom,
            isNew: true,
            tempId: `imported-${Date.now()}-${Math.random()}`,
          }));
          
          setPendingItems(newItems);
          setSaveSuccess(false);
          setSaveError("");
        } catch (err) {
          setSaveError("Erreur lors de la lecture du fichier Excel. Vérifiez le format.");
        }
      };
      
      reader.readAsBinaryString(file);
    } catch (err) {
      setSaveError("Erreur lors de l'import du fichier Excel.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors";

  return (
    <div>
      {view === "list" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Examens médicaux</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Gestion des examens médicaux disponibles par hôpital
            </p>
          </div>

          {hopitauxError && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
              <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">{hopitauxError}</span>
              <button onClick={() => setHopitauxError("")} className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Liste des hôpitaux
                  </h2>
                </div>
                <div className="relative w-full sm:w-80">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Rechercher un hôpital..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {hopitauxLoading ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">Chargement...</div>
            ) : hopitaux.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">Aucun hôpital trouvé.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hôpital</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {hopitaux.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{h.nom}</td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() => handleOpenManage(h)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Gérer
                            </button>
                            <button
                              onClick={() => handleOpenDetail(h)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                              Détail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {view === "manage" && selectedHopital && (
        <>
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Retour
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Gérer les examens médicaux
            </h1>
            <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
              {selectedHopital.nom}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cochez les examens médicaux disponibles dans cet hôpital, puis enregistrez vos sélections.
            </p>
          </div>

          {saveSuccess && (
            <div className="mb-4 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-lg text-sm">
              <span>Les associations ont été enregistrées avec succès.</span>
            </div>
          )}

          {saveError && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
              <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">{saveError}</span>
              <button onClick={() => setSaveError("")} className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Examens disponibles
              </h2>
            </div>

            {associationsLoading ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement...</div>
            ) : (
              <>
                {pendingItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    Aucun examen disponible dans le référentiel.
                  </div>
                ) : (
                  <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                    {pendingItems.map((item) => (
                      <label
                        key={item.tempId}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.isChecked || false}
                          onChange={() => handleToggleCheckbox(item.tempId)}
                          className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
                          {item.nom}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer les sélections"}
                  </button>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {pendingItems.filter(item => item.isChecked).length} examen(s) sélectionné(s)
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {view === "detail" && selectedHopital && (
        <>
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Retour
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Détail des examens médicaux
            </h1>
            <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
              {selectedHopital.nom}
            </p>
          </div>

          {detailError && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
              <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">{detailError}</span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Examens médicaux disponibles
            </h2>

            {detailLoading ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement...</div>
            ) : detailData && detailData.examens.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                Aucun examen médical n&apos;est actuellement associé à cet hôpital.
              </div>
            ) : detailData ? (
              <ul className="space-y-2">
                {detailData.examens.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {a.examen_nom}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
