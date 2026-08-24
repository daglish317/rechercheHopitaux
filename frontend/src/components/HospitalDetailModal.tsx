"use client";

import { useEffect, useState } from "react";
import { publicAPI, HopitalDetail } from "@/lib/public";
import {
  XIcon,
  MapPinIcon,
  PhoneIcon,
  HospitalIcon,
  VirusIcon,
  MicroscopeIcon,
  TagIcon,
} from "@/components/Icons";

interface HospitalDetailModalProps {
  hospitalId: number;
  onClose: () => void;
}

export default function HospitalDetailModal({
  hospitalId,
  onClose,
}: HospitalDetailModalProps) {
  const [hospital, setHospital] = useState<HopitalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await publicAPI.getHopitalDetail(hospitalId);
        setHospital(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des détails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center">
            <p className="text-red-600">Erreur lors du chargement des détails.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-[scaleIn_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <HospitalIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {hospital.nom}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {hospital.type_hopital_nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Fermer"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Coordonnées */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Coordonnées
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                      Adresse
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {hospital.adresse}
                    </p>
                  </div>
                </div>
                {hospital.telephone && (
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Téléphone
                      </p>
                      <a
                        href={`tel:${hospital.telephone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hospital.telephone}
                      </a>
                    </div>
                  </div>
                )}
                {hospital.latitude && hospital.longitude && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Coordonnées GPS
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {hospital.latitude}, {hospital.longitude}
                      </p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        📍 Itinéraire Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Maladies prises en charge */}
            {hospital.maladies && hospital.maladies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <VirusIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Maladies prises en charge ({hospital.maladies.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hospital.maladies.map((maladie, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium"
                    >
                      {maladie}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Examens médicaux */}
            {hospital.examens && hospital.examens.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MicroscopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Examens médicaux disponibles ({hospital.examens.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hospital.examens.map((examen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                    >
                      {examen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Plateaux techniques */}
            {hospital.plateaux_techniques && hospital.plateaux_techniques.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Plateaux techniques ({hospital.plateaux_techniques.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hospital.plateaux_techniques.map((plateau, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium"
                    >
                      {plateau}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucun service */}
            {(!hospital.maladies || hospital.maladies.length === 0) &&
              (!hospital.examens || hospital.examens.length === 0) &&
              (!hospital.plateaux_techniques || hospital.plateaux_techniques.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    Aucun service médical renseigné pour cet hôpital.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
