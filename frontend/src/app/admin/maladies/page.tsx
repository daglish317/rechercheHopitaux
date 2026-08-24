"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  maladieAPI,
  Maladie,
  HopitalLight,
  HopitalMaladies,
} from "@/lib/maladie";
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
}

export default function MaladiesPage() {
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

  const [allMaladies, setAllMaladies] = useState<Maladie[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [associationsLoading, setAssociationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [detailData, setDetailData] = useState<HopitalMaladies | null>(null);
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
      const response = await maladieAPI.getHopitaux({ search: q, page: p, page_size: 20 });
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

  const fetchMaladiesCatalogue = useCallback(async () => {
    try {
      const response = await maladieAPI.getAll();
      if (mountedRef.current) setAllMaladies(response.data);
    } catch { /* silent */ }
  }, []);

  const handleOpenManage = async (hopital: HopitalLight) => {
    setSelectedHopital(hopital);
    setAssociationsLoading(true);
    setSaveSuccess(false);
    setSaveError("");
    setPendingItems([]);
    setView("manage");
    try {
      const [assocRes] = await Promise.all([
        maladieAPI.getAssociations(hopital.id),
        fetchMaladiesCatalogue(),
      ]);
      if (mountedRef.current) {
        const existing = assocRes.data.maladies;
        const items: PendingItem[] = existing.map((a) => ({
          id: a.maladie,
          nom: a.maladie_nom,
          isNew: false,
          tempId: `existing-${a.maladie}`,
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
      const response = await maladieAPI.getAssociations(hopital.id);
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

  const handleSave = async () => {
    if (!selectedHopital) return;
    
    const emptyItems = pendingItems.filter(item => !item.nom.trim());
    if (emptyItems.length > 0) {
      setSaveError("Veuillez remplir tous les champs ou les supprimer.");
      return;
    }

    const names = pendingItems.map(item => item.nom.toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setSaveError("Certaines maladies sont en double. Veuillez les supprimer.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    
    try {
      const newItems = pendingItems.filter(item => item.isNew && item.nom.trim());
      const createdMaladies: Maladie[] = [];
      
      for (const item of newItems) {
        try {
          const response = await maladieAPI.create({ nom: item.nom.trim() });
          createdMaladies.push(response.data);
        } catch (err: any) {
          if (err.response?.status === 400) {
            const existing = allMaladies.find(m => m.nom.toLowerCase() === item.nom.toLowerCase());
            if (existing) {
              createdMaladies.push(existing);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }

      const existingIds = pendingItems
        .filter(item => !item.isNew && item.id)
        .map(item => item.id!);
      
      const newIds = createdMaladies.map(m => m.id);
      const allIds = [...existingIds, ...newIds];

      await maladieAPI.bulkSetAssociations(selectedHopital.id, allIds);
      
      if (mountedRef.current) {
        setSaveSuccess(true);
        await fetchMaladiesCatalogue();
        const res = await maladieAPI.getAssociations(selectedHopital.id);
        if (mountedRef.current) {
          setDetailData(res.data);
          const items: PendingItem[] = res.data.maladies.map((a) => ({
            id: a.maladie,
            nom: a.maladie_nom,
            isNew: false,
            tempId: `existing-${a.maladie}`,
          }));
          setPendingItems(items);
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
      const response = await maladieAPI.exportExcel(selectedHopital.id);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maladies_${selectedHopital.nom.replace(/\s+/g, "_")}.xlsx`;
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
          
          const maladieNames = dataRows
            .map(row => row[1])
            .filter(name => name && typeof name === 'string' && name.trim())
            .map(name => String(name).trim());
          
          const uniqueNames = Array.from(new Set(maladieNames));
          
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Maladies</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Gestion des maladies prises en charge par hôpital
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
              Gérer les maladies
            </h1>
            <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
              {selectedHopital.nom}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ajoutez les maladies prises en charge par cet hôpital. Vous pouvez en ajouter plusieurs avant d&apos;enregistrer.
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
                Maladies prises en charge
              </h2>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleImportExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <UploadIcon className="w-4 h-4" />
                  Importer Excel
                </button>
              </div>
            </div>

            {associationsLoading ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement...</div>
            ) : (
              <>
                {pendingItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    Aucune maladie n&apos;est actuellement associée à cet hôpital.
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {pendingItems.map((item) => (
                      <div key={item.tempId} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={item.nom}
                          onChange={(e) => handleItemChange(item.tempId, e.target.value)}
                          placeholder="Nom de la maladie"
                          className={inputClass}
                          readOnly={!item.isNew}
                        />
                        <button
                          onClick={() => handleRemoveItem(item.tempId)}
                          className="shrink-0 p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          aria-label="Retirer"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-6"
                >
                  <PlusIcon className="w-4 h-4" />
                  + Ajouter une maladie
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={pendingItems.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Exporter Excel
                  </button>
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
              Détail des maladies
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
              Maladies prises en charge
            </h2>

            {detailLoading ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement...</div>
            ) : detailData && detailData.maladies.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                Aucune maladie n&apos;est actuellement associée à cet hôpital.
              </div>
            ) : detailData ? (
              <ul className="space-y-2">
                {detailData.maladies.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {a.maladie_nom}
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
