"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import {
  CameraIcon,
  TrashIcon,
  EditIcon,
  LockIcon,
  UserIcon,
  MailIcon,
  CheckCircleIcon,
  XIcon,
  AlertIcon,
} from "@/components/Icons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const MEDIA_BASE_URL = API_BASE_URL.replace("/api", "");

export default function ProfilPage() {
  const { user, updateUser } = useAuth();

  const [editingNom, setEditingNom] = useState(false);
  const [nomValue, setNomValue] = useState("");
  const [nomError, setNomError] = useState("");
  const [savingNom, setSavingNom] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailError, setEmailError] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [deletePhotoModal, setDeletePhotoModal] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPhotoUrl = useCallback((photoPath: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `${MEDIA_BASE_URL}${photoPath}`;
  }, []);

  const handleStartEditNom = () => {
    setNomValue(user?.nom || "");
    setNomError("");
    setEditingNom(true);
  };

  const handleCancelEditNom = () => {
    setEditingNom(false);
    setNomValue("");
    setNomError("");
  };

  const handleSaveNom = async () => {
    setNomError("");
    setSavingNom(true);
    try {
      const response = await authAPI.updateProfile({ nom: nomValue });
      updateUser(response.data);
      setEditingNom(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          const message = data.nom
            ? Array.isArray(data.nom) ? data.nom[0] : String(data.nom)
            : "Une erreur est survenue.";
          setNomError(message);
        }
      } else {
        setNomError("Une erreur est survenue.");
      }
    } finally {
      setSavingNom(false);
    }
  };

  const handleStartEditEmail = () => {
    setEmailValue(user?.email || "");
    setEmailError("");
    setEditingEmail(true);
  };

  const handleCancelEditEmail = () => {
    setEditingEmail(false);
    setEmailValue("");
    setEmailError("");
  };

  const handleSaveEmail = async () => {
    setEmailError("");
    setSavingEmail(true);
    try {
      const response = await authAPI.updateProfile({ email: emailValue });
      updateUser(response.data);
      setEditingEmail(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          const message = data.email
            ? Array.isArray(data.email) ? data.email[0] : String(data.email)
            : "Une erreur est survenue.";
          setEmailError(message);
        }
      } else {
        setEmailError("Une erreur est survenue.");
      }
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const response = await authAPI.uploadPhoto(file);
      updateUser(response.data);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        const message = axiosError.response?.data?.error || "Erreur lors de l'envoi de la photo.";
        setPhotoError(message);
      } else {
        setPhotoError("Erreur lors de l'envoi de la photo.");
      }
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    setDeletingPhoto(true);
    try {
      const response = await authAPI.deletePhoto();
      updateUser(response.data);
      setDeletePhotoModal(false);
    } catch {
      setPhotoError("Erreur lors de la suppression de la photo.");
      setDeletePhotoModal(false);
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        ancien_mot_de_passe: ancienMdp,
        nouveau_mot_de_passe: nouveauMdp,
        confirmation: confirmationMdp,
      });
      setShowPasswordForm(false);
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmationMdp("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          const messages: string[] = [];
          for (const key in data) {
            const val = data[key];
            if (Array.isArray(val)) {
              messages.push(val[0]);
            } else if (typeof val === "string") {
              messages.push(val);
            }
          }
          setPasswordError(messages.length > 0 ? messages.join(" ") : "Une erreur est survenue.");
        }
      } else {
        setPasswordError("Une erreur est survenue.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const photoUrl = getPhotoUrl(user?.photo ?? null);
  const initials = user?.nom
    ? user.nom
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
        <p className="mt-2 text-slate-600">Gestion des informations de votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
                onClick={handlePhotoClick}
                title="Modifier la photo de profil"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Photo de profil"
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-white shadow-md">
                    <span className="text-4xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-white/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out dark:bg-slate-900/60">
                  <CameraIcon className="w-7 h-7 text-white" />
                  <span className="mt-1.5 text-xs font-medium text-white">
                    {uploadingPhoto ? "Envoi..." : "Modifier"}
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoError && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600 text-center">
                  <AlertIcon className="w-4 h-4 shrink-0" />
                  {photoError}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CameraIcon className="w-4 h-4" />
                  {user?.photo ? "Remplacer" : "Ajouter une photo"}
                </button>
                {user?.photo && (
                  <>
                    <span className="h-5 w-px bg-slate-200" />
                    <button
                      onClick={() => setDeletePhotoModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Supprimer
                    </button>
                  </>
                )}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-900 text-center">{user?.nom}</h2>
              <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                {user?.role === "ADMINISTRATEUR" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-6">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Informations personnelles
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
                {editingNom ? (
                  <div>
                    <input
                      type="text"
                      value={nomValue}
                      onChange={(e) => setNomValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
                      placeholder="Votre nom"
                      autoFocus
                    />
                    {nomError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                        <AlertIcon className="w-4 h-4 shrink-0" />
                        {nomError}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleSaveNom}
                        disabled={savingNom || !nomValue.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {savingNom ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={handleCancelEditNom}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={user?.nom || ""}
                      readOnly
                      className="w-full min-w-0 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 cursor-default"
                    />
                    <button
                      onClick={handleStartEditNom}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg whitespace-nowrap transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse email
                </label>
                {editingEmail ? (
                  <div>
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
                      placeholder="votre@email.com"
                      autoFocus
                    />
                    {emailError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                        <AlertIcon className="w-4 h-4 shrink-0" />
                        {emailError}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleSaveEmail}
                        disabled={savingEmail || !emailValue.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {savingEmail ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={handleCancelEditEmail}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative w-full min-w-0">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 cursor-default"
                      />
                    </div>
                    <button
                      onClick={handleStartEditEmail}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg whitespace-nowrap transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rôle</label>
                <input
                  type="text"
                  value={user?.role === "ADMINISTRATEUR" ? "Administrateur" : "Utilisateur"}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-slate-600">Le rôle ne peut pas être modifié.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <LockIcon className="w-5 h-5 text-blue-600" />
                Mot de passe
              </h3>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 transition-colors"
                >
                  <EditIcon className="w-4 h-4" />
                  Modifier le mot de passe
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <form onSubmit={handleChangePassword}>
                {passwordError && (
                  <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-lg text-sm">
                    <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Ancien mot de passe
                    </label>
                    <input
                      type="password"
                      value={ancienMdp}
                      onChange={(e) => setAncienMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={nouveauMdp}
                      onChange={(e) => setNouveauMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmationMdp}
                      onChange={(e) => setConfirmationMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="submit"
                    disabled={savingPassword || !ancienMdp || !nouveauMdp || !confirmationMdp}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {savingPassword ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setAncienMdp("");
                      setNouveauMdp("");
                      setConfirmationMdp("");
                      setPasswordError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                Votre mot de passe ne peut pas être affiché. Vous pouvez le modifier à tout moment.
              </p>
            )}
          </div>
        </div>
      </div>

      {deletePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4 dark:bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <TrashIcon className="w-5 h-5 text-red-600" />
                Supprimer la photo de profil
              </h3>
              <button
                onClick={() => setDeletePhotoModal(false)}
                className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer votre photo de profil ? Un avatar avec vos
                initiales sera affiché à la place.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setDeletePhotoModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeletePhoto}
                disabled={deletingPhoto}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <TrashIcon className="w-4 h-4" />
                {deletingPhoto ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
