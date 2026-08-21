"use client";

import Link from"next/link";
import { useAuth } from"@/contexts/AuthContext";
import {
 HospitalIcon,
 TagIcon,
 VirusIcon,
 PillIcon,
 MicroscopeIcon,
 CogIcon,
 DashboardIcon,
} from"@/components/Icons";

const modules = [
 {
 href:"/admin/hopitaux",
 title:"Hopitaux",
 description:"Structures, coordonnees, statut et localisation",
 icon: HospitalIcon,
 tone:"bg-teal-50 text-teal-700",
 },
 {
 href:"/admin/types-hopitaux",
 title:"Types d'hopitaux",
 description:"Classification des etablissements",
 icon: TagIcon,
 tone:"bg-blue-50 text-blue-700",
 },
 {
 href:"/admin/maladies",
 title:"Maladies",
 description:"Catalogue des pathologies referencees",
 icon: VirusIcon,
 tone:"bg-rose-50 text-rose-700",
 },
 {
 href:"/admin/prises-en-charge",
 title:"Prises en charge",
 description:"Lien entre maladies et hopitaux",
 icon: PillIcon,
 tone:"bg-emerald-50 text-emerald-700",
 },
 {
 href:"/admin/examens-medicaux",
 title:"Examens medicaux",
 description:"Examens disponibles par structure",
 icon: MicroscopeIcon,
 tone:"bg-indigo-50 text-indigo-700",
 },
 {
 href:"/admin/plateau-technique",
 title:"Plateau technique",
 description:"Equipements et capacites techniques",
 icon: CogIcon,
 tone:"bg-amber-50 text-amber-700",
 },
];

export default function AdminDashboardPage() {
 const { user } = useAuth();

 return (
 <div className="space-y-6">
 <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
 <span className="h-2 w-2 rounded-full bg-teal-500" />
 Administration SanteProx
 </div>
 <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
 Tableau de bord
 </h1>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
 Bienvenue {user?.nom ||"administrateur"}. Les modules ci-dessous
 pilotent les donnees visibles dans la recherche publique.
 </p>
 </div>

 <Link
 href="/admin/profil"
 className="inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
 >
 Gerer mon profil
 </Link>
 </div>
 </section>

 <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
 <DashboardIcon className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-950">
 Modules disponibles
 </p>
 <p className="text-xs text-slate-500">
 Acces direct aux pages de gestion
 </p>
 </div>
 </div>

 <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
 {modules.map((module) => {
 const Icon = module.icon;
 return (
 <Link
 key={module.href}
 href={module.href}
  className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
 >
 <div className="flex items-start gap-4">
 <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${module.tone}`}>
 <Icon className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <h3 className="font-semibold text-slate-950 group-hover:text-teal-700:text-teal-300">
 {module.title}
 </h3>
 <p className="mt-1 text-sm leading-5 text-slate-600">
 {module.description}
 </p>
 </div>
 </div>
 </Link>
 );
 })}
 </div>
 </section>
 </div>
 );
}

