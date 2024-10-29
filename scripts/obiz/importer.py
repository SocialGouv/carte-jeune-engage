# importer.py
import json
import requests
from typing import List, Dict
from config.genre_mapping import GenreMapper
from config.sousgenres_whitelist import sousgenre_ids
from config.utils import convert_date_format
import argparse


class DataImporter:
    def __init__(self, api_url: str, api_key: str):
        self.genre_mapper = GenreMapper()
        self.source_files = [
            'inputs/reduccine.fr-preprod.json',
            'inputs/reduckdo.fr-preprod.json',
            'inputs/reducparc.fr-preprod.json'
        ]
        self.api_url = api_url
        self.api_key = api_key

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

        reduction_percentages = sorted(set(
            article['reductionPercentage']
            for article in offer['articles']
            if article.get('reductionPercentage') is not None
        ))

        validity_dates = [
            article['validityTo']
            for article in offer['articles']
            if article.get('validityTo')
        ]
        if validity_dates:
            offer['validityTo'] = max(validity_dates)

        partner_name = sousgenre.get('sousgenres_nom', '')

        if len(reduction_percentages) == 0:
            offer['title'] = f"Offre chez {partner_name}"
        elif len(reduction_percentages) == 1:
            offer['title'] = f"-{int(reduction_percentages[0])}% chez {partner_name}"
        else:
            min_reduction = int(min(reduction_percentages))
            max_reduction = int(max(reduction_percentages))
            offer['title'] = f"Entre -{min_reduction}% et -{max_reduction}% chez {partner_name}"

        offer['formatedTitle'] = offer['title']

        return offer

    def send_to_api(self, offers: List[Dict]) -> None:
        """
        Envoie les offres traitées à l'API
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "obiz_offers": offers
        }

        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            print(f"Successfully sent {len(offers)} offers to API")
            print(f"API Response: {response.json()}")

        except requests.exceptions.RequestException as e:
            print(f"Error sending data to API: {str(e)}")
            if hasattr(e.response, 'text'):
                print(f"Response content: {e.response.text}")

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

    def process_article(self, article: Dict, sousgenre: Dict, genre_name: str, source: str) -> Dict or None:
        """
        Traite un article spécifique
        """

        articleKind = "variable_price" if article.get('articles_valeur_variable') == "True" else "fixed_price"

        offerArticle = {
            "name": article.get('articles_nom'),
            "available": article.get('articles_actif') == 'True',
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
                                                if category and category not in offers_by_id[sousgenre_id]['categories']:
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

        if offers:
            print(f"\nProcessed {len(offers)} offers, sending to API...")
            self.send_to_api(offers)
        else:
            print("No offers to send to API")




def main():
    parser = argparse.ArgumentParser(description='Import Obiz data and send to API')
    parser.add_argument('--api-url',
                       default="http://localhost:3000/api/obizIntegration",
                       help='API URL (default: http://localhost:3000/api/obizIntegration)')
    parser.add_argument('--api-key',
                       required=True,
                       help='API Key for authentication')

    args = parser.parse_args()

    importer = DataImporter(api_url=args.api_url, api_key=args.api_key)
    importer.import_data()


if __name__ == "__main__":
    main()