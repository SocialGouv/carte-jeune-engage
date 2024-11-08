from typing import Dict, Optional
from enum import Enum

class Category(Enum):
    """
    Énumération des catégories selon la structure fournie
    """
    TELEPHONY = "Internet et abonnements"
    BANK = "Banque et assurance"
    CULTURE = "Livres, presse et culture"
    EQUIPMENT = "High Tech et équipements"
    HYGIENE = "Hygiène et beauté"
    SPORT = "Sport"
    HOBBY = "Loisirs et sorties"
    MOBILITY = "Transport et voyage"
    FASHION = "Mode et vêtements"
    SHOP = "Courses et restauration"

class GenreMapper:
    """
    Classe pour gérer les correspondances entre genres et catégories
    """
    def __init__(self, mapping_file: str = None):
        self._mapping: Dict[str, Category] = {
            # reduccine
            "Abonnements": Category.TELEPHONY,
            "E-billets": Category.HOBBY,
            "Billets papier": Category.HOBBY,
            "Achats groupés par lot": Category.SHOP,

            # reduckdo
            "Sport": Category.SPORT,
            "Alimentation, Gastronomie": Category.SHOP,
            "Brico, Déco, Aménagement": Category.EQUIPMENT,
            "Chèques Culture": Category.CULTURE,
            "Cours en Ligne, Coaching": Category.CULTURE,
            "Escape Game, Autres Loisirs": Category.HOBBY,
            "Jeux, Livres, Puériculture": Category.CULTURE,
            "Loisirs": Category.HOBBY,
            "Mode, Beauté, Parfumerie": Category.FASHION,
            "Multi-Enseigne, Gd Distrib": Category.SHOP,
            "Produits Artisanaux": Category.SHOP,
            "Voyages": Category.MOBILITY,
            "VR / Coaching eSport": Category.HOBBY,
            "Abonnement Digital, Multimédia": Category.EQUIPMENT,
            "Echèques": Category.SHOP,

            # reducparc
            "Aquariums": Category.HOBBY,
            "E-coffret Expériences": Category.HOBBY,
            "Grands Parcs": Category.HOBBY,
            "Loisirs & Tourisme": Category.HOBBY,
            "Offres Séjours": Category.MOBILITY,
            "Parcs animaliers": Category.HOBBY,
            "Parcs aquatiques": Category.HOBBY,
            "Parcs culturels": Category.HOBBY,
            "Parcs d'attractions": Category.HOBBY,

            #other
            "Nouveautés": Category.HOBBY
        }

    def get_category(self, genre: str) -> Optional[str]:
        """
        Retourne la catégorie correspondant au genre
        """
        category = self._mapping.get(genre)
        return category.value if category else None