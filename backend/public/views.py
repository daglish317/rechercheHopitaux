from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from math import radians, cos, sin, asin, sqrt

from hopital.models import Hopital
from maladie.models import Maladie
from examen.models import ExamenMedical
from plateau.models import PlateauTechnique
from .serializers import HopitalSearchSerializer, HopitalDetailSerializer


class SearchSuggestionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        
        if not query or len(query) < 2:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)
        
        suggestions = []
        
        # Rechercher dans les maladies
        maladies = Maladie.objects.filter(
            nom__icontains=query
        ).values_list('nom', flat=True).distinct()[:3]
        
        for maladie in maladies:
            suggestions.append({
                "text": maladie,
                "type": "maladie",
                "icon": "virus"
            })
        
        # Rechercher dans les examens
        examens = ExamenMedical.objects.filter(
            nom__icontains=query
        ).values_list('nom', flat=True).distinct()[:3]
        
        for examen in examens:
            suggestions.append({
                "text": examen,
                "type": "examen",
                "icon": "clipboard"
            })
        
        # Rechercher dans les plateaux techniques
        plateaux = PlateauTechnique.objects.filter(
            nom__icontains=query
        ).values_list('nom', flat=True).distinct()[:3]
        
        for plateau in plateaux:
            suggestions.append({
                "text": plateau,
                "type": "plateau",
                "icon": "beaker"
            })
        
        # Rechercher dans les hôpitaux
        hopitaux = Hopital.objects.filter(
            Q(nom__icontains=query) | Q(adresse__icontains=query),
            statut="ACTIF"
        ).values_list('nom', flat=True).distinct()[:3]
        
        for hopital in hopitaux:
            suggestions.append({
                "text": hopital,
                "type": "hopital",
                "icon": "hospital"
            })
        
        # Limiter à 8 suggestions maximum
        return Response({"suggestions": suggestions[:8]}, status=status.HTTP_200_OK)


class HopitalSearchView(APIView):
    permission_classes = [AllowAny]

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calcule la distance entre deux points géographiques en km
        Formule de Haversine
        """
        R = 6371  # Rayon de la Terre en kilomètres

        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))

        return R * c

    def format_distance(self, distance_km):
        """Formate la distance en texte lisible"""
        if distance_km < 1:
            return f"{int(distance_km * 1000)} m"
        elif distance_km < 10:
            return f"{distance_km:.1f} km"
        else:
            return f"{int(distance_km)} km"

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        user_lat = request.query_params.get("lat", None)
        user_lon = request.query_params.get("lon", None)
        max_distance = request.query_params.get("radius", None)

        # Si l'utilisateur a fourni sa position
        if user_lat and user_lon:
            try:
                user_lat = float(user_lat)
                user_lon = float(user_lon)
            except (ValueError, TypeError):
                user_lat = None
                user_lon = None

        # Si pas de recherche, retourner tous les hôpitaux actifs
        if not query:
            hopitaux = (
                Hopital.objects.select_related("type_hopital")
                .prefetch_related("examens__examen", "plateaux_techniques__plateau_technique", "prises_en_charge__maladie")
                .filter(statut="ACTIF")
            )
        else:
            # Recherche insensible à la casse avec icontains
            hopitaux = (
                Hopital.objects.select_related("type_hopital")
                .prefetch_related("examens__examen", "plateaux_techniques__plateau_technique", "prises_en_charge__maladie")
                .filter(statut="ACTIF")
                .filter(
                    Q(nom__icontains=query)
                    | Q(adresse__icontains=query)
                    | Q(type_hopital__nom__icontains=query)
                    | Q(examens__examen__nom__icontains=query)
                    | Q(plateaux_techniques__plateau_technique__nom__icontains=query)
                    | Q(prises_en_charge__maladie__nom__icontains=query)
                )
                .distinct()
            )

        results = {"located": [], "not_located": [], "user_position": None}
        
        if user_lat and user_lon:
            results["user_position"] = {"lat": user_lat, "lon": user_lon}

        # Traiter chaque hôpital
        for hopital in hopitaux:
            serializer = HopitalSearchSerializer(hopital)
            data = serializer.data
            
            # Ajouter les éléments correspondants à la recherche
            if query:
                matched_maladies = []
                matched_examens = []
                matched_plateaux = []
                
                # Vérifier les maladies
                for prise in hopital.prises_en_charge.all():
                    if query.lower() in prise.maladie.nom.lower():
                        matched_maladies.append(prise.maladie.nom)
                
                # Vérifier les examens
                for exam in hopital.examens.all():
                    if query.lower() in exam.examen.nom.lower():
                        matched_examens.append(exam.examen.nom)
                
                # Vérifier les plateaux techniques
                for plateau in hopital.plateaux_techniques.all():
                    if query.lower() in plateau.plateau_technique.nom.lower():
                        matched_plateaux.append(plateau.plateau_technique.nom)
                
                data["matched_maladies"] = matched_maladies
                data["matched_examens"] = matched_examens
                data["matched_plateaux"] = matched_plateaux
            else:
                data["matched_maladies"] = []
                data["matched_examens"] = []
                data["matched_plateaux"] = []

            # Si l'hôpital a des coordonnées GPS
            if hopital.latitude and hopital.longitude:
                if user_lat and user_lon:
                    # Calculer la distance
                    distance_km = self.calculate_distance(
                        user_lat,
                        user_lon,
                        float(hopital.latitude),
                        float(hopital.longitude),
                    )

                    # Filtrer par rayon si spécifié
                    if max_distance:
                        try:
                            if distance_km > float(max_distance):
                                continue
                        except (ValueError, TypeError):
                            pass

                    data["distance_km"] = round(distance_km, 1)
                    data["distance_text"] = self.format_distance(distance_km)
                else:
                    data["distance_km"] = None
                    data["distance_text"] = None

                results["located"].append(data)
            else:
                # Hôpital sans coordonnées GPS
                data["distance_km"] = None
                data["distance_text"] = None
                results["not_located"].append(data)

        # Trier les hôpitaux localisés par distance si position utilisateur disponible
        if user_lat and user_lon:
            results["located"].sort(key=lambda x: x.get("distance_km", float("inf")))

        # Trier les hôpitaux non localisés par nom
        results["not_located"].sort(key=lambda x: x["nom"])

        return Response(results, status=status.HTTP_200_OK)


class HopitalPublicDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        hopital = get_object_or_404(
            Hopital.objects.select_related("type_hopital"), pk=pk
        )
        serializer = HopitalDetailSerializer(hopital)
        return Response(serializer.data, status=status.HTTP_200_OK)
