# importer.py
import json
from typing import List, Dict
from config.genre_mapping import GenreMapper
from config.sousgenres_whitelist import sousgenre_ids
from config.utils import convert_date_format


class DataImporter:
    def __init__(self):
        self.genre_mapper = GenreMapper()
        self.source_files = [
            'inputs/reduccine.fr-preprod.json',
            'inputs/reduckdo.fr-preprod.json',
            'inputs/reducparc.fr-preprod.json'
        ]

    @staticmethod
    def convert_french_number(number_str: str) -> float:
        """
        Convertit un nombre au format français (avec virgule) en float
        """
        try:
            return float(number_str.replace(',', '.'))
        except (ValueError, AttributeError):
            return 0.0

    @staticmethod
    def enrich_offer(offer: Dict, sousgenre: Dict) -> Dict:
        """
        Enrichit l'offre avec les informations calculées à partir des articles
        """
        if not offer or not offer.get('articles'):
            return offer

        # Récupère tous les pourcentages de réduction uniques (non nuls)
        reduction_percentages = sorted(set(
            article['reductionPercentage']
            for article in offer['articles']
            if article.get('reductionPercentage') is not None
        ))

        # Trouve la date de validité la plus éloignée
        validity_dates = [
            article['validityTo']
            for article in offer['articles']
            if article.get('validityTo')
        ]
        if validity_dates:
            offer['validityTo'] = max(validity_dates)

        # Construit le titre formaté
        partner_name = sousgenre.get('sousgenres_nom', '')

        if len(reduction_percentages) == 0:
            offer['formatedTitle'] = f"Offre chez {partner_name}"
        elif len(reduction_percentages) == 1:
            offer['formatedTitle'] = f"-{int(reduction_percentages[0])}% chez {partner_name}"
        else:
            min_reduction = int(min(reduction_percentages))
            max_reduction = int(max(reduction_percentages))
            offer['formatedTitle'] = f"Entre -{min_reduction}% et -{max_reduction}% chez {partner_name}"

        return offer

    def process_sousgenre(self, genre: Dict, sousgenre: Dict, genre_name: str, source: str) -> Dict:
        """
        Traite un sous-genre spécifique
        """
        return {
            "obiz_id": sousgenre.get('sousgenres_id'),
            "categories": [self.genre_mapper.get_category(genre.get('genres_nom'))],
            "source": "obiz",
            "kind": "code_obiz",
            "partner": {
                "name": sousgenre.get('sousgenres_nom'),
                "color": "#000000",
                "icon_url": sousgenre.get('sousgenres_logo')
            }
        }

    def process_article(self, article: Dict, sousgenre: Dict, genre_name: str, source: str) -> Dict:
        """
        Traite un article spécifique
        """
        articleKind = "variable_price" if article.get('articles_valeur_variable') == "True" else "fixed_price"

        offerArticle = {
            "name": article.get('articles_nom'),
            "reference": article.get('articles_code'),
            "reductionPercentage": self.convert_french_number(article.get('articles_remise_btob')),
            "validityTo": convert_date_format(article.get('articles_date_fin')),
            "kind": articleKind,
            "obizJson": json.dumps(article)
        }

        if articleKind == "variable_price":
            offerArticle['minimumPrice'] = self.convert_french_number(article.get('articles_valeur_min'))
            offerArticle['maximumPrice'] = self.convert_french_number(article.get('articles_valeur_max'))
        else:
            offerArticle['publicPrice'] = self.convert_french_number(article.get('articles_prix_public'))
            offerArticle['price'] = self.convert_french_number(article.get('articles_puttc'))

        return offerArticle

    def import_data(self) -> None:
        """
        Importe et traite les données de tous les fichiers sources
        """
        offers_by_id = {}

        for file_path in self.source_files:
            source = file_path.split('/')[-1].split('.')[0]
            print(f"\nProcessing source: {source}")

            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)

                for catalogue in data.get('catalogues', []):
                    for cat in catalogue.get('catalogue', []):
                        for genres in cat.get('genres', []):
                            for genre in genres.get('genre', []):
                                genre_name = genre.get('genres_nom', '')
                                category = self.genre_mapper.get_category(genre_name)

                                for sousgenres in genre.get('sousgenres', []):
                                    for sousgenre in sousgenres.get('sousgenre', []):
                                        sousgenre_id = sousgenre.get('sousgenres_id')

                                        if sousgenre_id in sousgenre_ids:
                                            if sousgenre_id in offers_by_id:
                                                if category and category not in offers_by_id[sousgenre_id][
                                                    'categories']:
                                                    offers_by_id[sousgenre_id]['categories'].append(category)
                                            else:
                                                offer = self.process_sousgenre(genre, sousgenre, genre_name, source)
                                                offer['articles'] = []

                                                for articles in sousgenre.get('articles', []):
                                                    for article in articles.get('article', []):
                                                        offerArticle = self.process_article(
                                                            article, sousgenre, genre_name, source)
                                                        if offerArticle:
                                                            offer['articles'].append(offerArticle)

                                                offer = self.enrich_offer(offer, sousgenre)

                                                offers_by_id[sousgenre_id] = offer

            except FileNotFoundError:
                print(f"File not found: {file_path}")
            except json.JSONDecodeError:
                print(f"Error decoding JSON from file: {file_path}")
            except Exception as e:
                print(f"Error processing file {file_path}: {str(e)}")

        offers = list(offers_by_id.values())
        print(json.dumps(offers, indent=2))


def main():
    importer = DataImporter()
    importer.import_data()


if __name__ == "__main__":
    main()