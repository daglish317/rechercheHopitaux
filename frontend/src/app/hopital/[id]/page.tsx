"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { publicAPI, HopitalDetail } from "@/lib/public";

export default function HopitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hopital, setHopital] = useState<HopitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const id = params?.id ? Number(params.id) : null;

  const fetchHopital = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await publicAPI.getHopitalDetail(id);
      setHopital(response.data);
    } catch {
      setError("Hôpital non trouvé.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchHopital();
    };
    load();
  }, [fetchHopital]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Hopital
          </Link>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !hopital) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Hopital
          </Link>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-500 mb-4">{error || "Hôpital non trouvé."}</p>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Hopital
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la recherche
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{hopital.nom}</h1>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
            {hopital.type_hopital_nom}
          </span>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700">{hopital.adresse}</span>
            </div>

            {hopital.telephone && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{hopital.telephone}</span>
              </div>
            )}
          </div>
        </div>

        {hopital.maladies.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Maladies prises en charge
            </h2>
            <div className="flex flex-wrap gap-2">
              {hopital.maladies.map((maladie, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full"
                >
                  {maladie}
                </span>
              ))}
            </div>
          </div>
        )}

        {hopital.examens.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Examens médicaux
            </h2>
            <div className="flex flex-wrap gap-2">
              {hopital.examens.map((examen, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full"
                >
                  {examen}
                </span>
              ))}
            </div>
          </div>
        )}

        {hopital.plateaux_techniques.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Plateau technique
            </h2>
            <div className="flex flex-wrap gap-2">
              {hopital.plateaux_techniques.map((plateau, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-full"
                >
                  {plateau}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
