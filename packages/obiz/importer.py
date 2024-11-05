# importer.py
import paramiko
import json
import requests
from jsonpath_ng import parse
from typing import List, Dict
from config.genre_mapping import GenreMapper
from config.sousgenres_whitelist import sousgenre_ids
from config.utils import convert_date_format
import argparse
from pathlib import Path


class DataImporter:
    def __init__(self, api_url: str, api_key: str, sftp_host: str, sftp_port: int,
                 sftp_username: str, sftp_password: str, sftp_path: str, file_suffix: str):
        self.genre_mapper = GenreMapper()
        self.source_files = [
            f'reduccine.{file_suffix}.json',
            f'reduckdo.{file_suffix}.json',
            f'reducparc.{file_suffix}.json'
        ]
        self.api_url = api_url
        self.api_key = api_key

        self.sftp_client = None
        self.sftp_host = sftp_host
        self.sftp_port = sftp_port
        self.sftp_username = sftp_username
        self.sftp_password = sftp_password
        self.sftp_path = sftp_path

    def __del__(self):
        if self.sftp_client:
            self.sftp_client.close()

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
            if article.get('reductionPercentage') is not None and article.get('available') == True
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
            offer['title'] = f"Offre"
        elif len(reduction_percentages) == 1:
            offer['title'] = f"-{int(reduction_percentages[0])}%"
        else:
            min_reduction = int(min(reduction_percentages))
            max_reduction = int(max(reduction_percentages))
            offer['title'] = f"Entre -{min_reduction}% et -{max_reduction}%"

        offer['formatedTitle'] = offer['title']

        return offer

    def connect_sftp(self):
        """Établit la connexion SFTP"""
        try:
            transport = paramiko.Transport((self.sftp_host, self.sftp_port))
            transport.connect(username=self.sftp_username, password=self.sftp_password)
            self.sftp_client = paramiko.SFTPClient.from_transport(transport)
        except Exception as e:
            print(f"Error connecting to SFTP: {str(e)}")
            raise

    def get_file_from_sftp(self, file_name: str) -> dict:
        """
        Récupère un fichier JSON depuis SFTP et le retourne comme dictionnaire
        """
        try:
            if self.sftp_client is None:
                self.connect_sftp()

            remote_path = Path(self.sftp_path) / file_name

            temp_file = f"/tmp/{file_name}"
            self.sftp_client.get(str(remote_path), temp_file)

            with open(temp_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            Path(temp_file).unlink()

            return data
        except Exception as e:
            print(f"Error getting file {file_name} from SFTP: {str(e)}")
            return None

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
            "description": (sousgenre.get('sousgenres_descriptif') or {}).get('#cdata-section', ''),
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
            "description":  (article.get('articles_descriptif') or {}).get('#cdata-section', ''),
            "available": article.get('articles_actif') == 'True',
            "reference": article.get('articles_code'),
            "reductionPercentage": self.convert_french_number(article.get('articles_remise_btob')),
            "validityTo": convert_date_format(article.get('articles_date_fin')),
            "kind": articleKind,
            "image_url": article.get('articles_image'),
            "obizJson": json.dumps(article),
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

        genre_expr = parse('$.catalogues[*].catalogue[*].genres[*].genre[*]')

        for file_name in self.source_files:
            source = file_name.split('.')[0]
            print(f"\nProcessing source: {source}")

            try:
                data = self.get_file_from_sftp(file_name)
                if not data:
                    continue

                genres = [match.value for match in genre_expr.find(data)]

                for genre in genres:
                    sousgenres_expr = parse('$.sousgenres[*].sousgenre[*]')
                    sousgenres = [match.value for match in sousgenres_expr.find(genre)]
                    for sousgenre in sousgenres:
                        sousgenre_id = sousgenre.get('sousgenres_id')
                        if sousgenre_id in sousgenre_ids:
                            genre_name = genre.get('genres_nom')
                            category = self.genre_mapper.get_category(genre_name)

                            if sousgenre_id in offers_by_id:
                                if category and category not in offers_by_id[sousgenre_id]['categories']:
                                    offers_by_id[sousgenre_id]['categories'].append(category)
                            else:
                                offer = self.process_sousgenre(
                                    {'genres_nom': genre_name},
                                    sousgenre,
                                    genre_name,
                                    source
                                )
                                offer['articles'] = []

                                articles_expr = parse('$.articles[*].article[*]')
                                articles = [match.value for match in articles_expr.find(sousgenre)]

                                for article in articles:
                                    offer_article = self.process_article(
                                        article, sousgenre, genre_name, source
                                    )
                                    if offer_article:
                                        offer['articles'].append(offer_article)

                                offer = self.enrich_offer(offer, sousgenre)
                                offers_by_id[sousgenre_id] = offer

            except Exception as e:
                print(f"Error processing file {file_name}: {str(e)}")

        offers = list(offers_by_id.values())

        if offers:
            print(f"\nProcessed {len(offers)} offers, sending to API...")
            self.send_to_api(offers)
        else:
            print("No offers to send to API")


def main():
    parser = argparse.ArgumentParser(description='Import Obiz data from SFTP and send to API')
    parser.add_argument('--api-url',
                       default="http://localhost:3000/api/obizIntegration",
                       help='API URL (default: http://localhost:3000/api/obizIntegration)')
    parser.add_argument('--api-key',
                       required=True,
                       help='API Key for authentication')

    # Arguments SFTP
    parser.add_argument('--sftp-host',
                       required=True,
                       help='SFTP host')
    parser.add_argument('--sftp-port',
                       type=int,
                       default=22,
                       help='SFTP port (default: 22)')
    parser.add_argument('--sftp-username',
                       required=True,
                       help='SFTP username')
    parser.add_argument('--sftp-password',
                       required=True,
                       help='SFTP password')
    parser.add_argument('--sftp-path',
                       required=True,
                       help='SFTP remote path')
    
    parser.add_argument('--file-suffix',
                       required=True,
                       help='Obiz file suffix')

    args = parser.parse_args()

    importer = DataImporter(
        api_url=args.api_url,
        api_key=args.api_key,
        sftp_host=args.sftp_host,
        sftp_port=args.sftp_port,
        sftp_username=args.sftp_username,
        sftp_password=args.sftp_password,
        sftp_path=args.sftp_path,
        file_suffix=args.file_suffix
    )
    importer.import_data()


if __name__ == "__main__":
    main()