"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";

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
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="mt-2 text-gray-600">Gestion des informations de votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center border-4 border-gray-200">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">
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
                <p className="mt-2 text-sm text-red-600 text-center">{photoError}</p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  {user?.photo ? "Remplacer" : "Ajouter une photo"}
                </button>
                {user?.photo && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setDeletePhotoModal(true)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.nom}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="mt-2 inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user?.role === "ADMINISTRATEUR" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informations personnelles
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                {editingNom ? (
                  <div>
                    <input
                      type="text"
                      value={nomValue}
                      onChange={(e) => setNomValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    {nomError && (
                      <p className="mt-1 text-sm text-red-600">{nomError}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleSaveNom}
                        disabled={savingNom || !nomValue.trim()}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingNom ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={handleCancelEditNom}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={user?.nom || ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
                    />
                    <button
                      onClick={handleStartEditNom}
                      className="ml-3 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                {editingEmail ? (
                  <div>
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleSaveEmail}
                        disabled={savingEmail || !emailValue.trim()}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingEmail ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={handleCancelEditEmail}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
                    />
                    <button
                      onClick={handleStartEditEmail}
                      className="ml-3 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <input
                  type="text"
                  value={user?.role === "ADMINISTRATEUR" ? "Administrateur" : "Utilisateur"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">Le rôle ne peut pas être modifié.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Mot de passe</h3>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Modifier le mot de passe
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <form onSubmit={handleChangePassword}>
                {passwordError && (
                  <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ancien mot de passe
                    </label>
                    <input
                      type="password"
                      value={ancienMdp}
                      onChange={(e) => setAncienMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={nouveauMdp}
                      onChange={(e) => setNouveauMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmationMdp}
                      onChange={(e) => setConfirmationMdp(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={savingPassword || !ancienMdp || !nouveauMdp || !confirmationMdp}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-500">
                Votre mot de passe ne peut pas être affiché. Vous pouvez le modifier à tout moment.
              </p>
            )}
          </div>
        </div>
      </div>

      {deletePhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Supprimer la photo de profil
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer votre photo de profil ? Un avatar avec vos
                initiales sera affiché à la place.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeletePhotoModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDeletePhoto}
                disabled={deletingPhoto}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deletingPhoto ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
