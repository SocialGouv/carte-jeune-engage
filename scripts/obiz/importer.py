# importer.py
import json
from typing import List, Dict
from config.genre_mapping import GenreMapper
from config.sousgenres_whitelist import sousgenre_ids


class DataImporter:
    def __init__(self):
        self.genre_mapper = GenreMapper()
        self.source_files = [
            'inputs/reduccine.fr-preprod.json',
            'inputs/reduckdo.fr-preprod.json',
            'inputs/reducparc.fr-preprod.json'
        ]

    def process_sousgenre(self, sousgenre: Dict, genre_name: str, source: str) -> None:
        """
        Traite un sous-genre spécifique
        À compléter avec vos traitements
        """
        print(f"Processing sousgenre: {sousgenre.get('sousgenres_nom')} from {source}")
        pass

    def process_article(self, article: Dict, sousgenre: Dict, genre_name: str, source: str) -> None:
        """
        Traite un article spécifique
        À compléter avec vos traitements
        """
        print(f"Processing article: {article.get('articles_nom')} from {source}")
        pass

    def import_data(self) -> None:
        """
        Importe et traite les données de tous les fichiers sources
        """
        for file_path in self.source_files:
            source = file_path.split('/')[-1].split('.')[0]
            print(f"\nProcessing source: {source}")

            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)

                # Parcours de la structure du JSON
                for catalogue in data.get('catalogues', []):
                    for cat in catalogue.get('catalogue', []):
                        for genres in cat.get('genres', []):
                            for genre in genres.get('genre', []):
                                genre_name = genre.get('genres_nom', '')

                                for sousgenres in genre.get('sousgenres', []):
                                    for sousgenre in sousgenres.get('sousgenre', []):
                                        # Vérifie si le sous-genre est dans la whitelist
                                        if sousgenre.get('sousgenres_id') in sousgenre_ids:
                                            # Traitement du sous-genre
                                            self.process_sousgenre(sousgenre, genre_name, source)

                                            # Traitement des articles du sous-genre
                                            for articles in sousgenre.get('articles', []):
                                                for article in articles.get('article', []):
                                                    self.process_article(article, sousgenre, genre_name, source)

            except FileNotFoundError:
                print(f"File not found: {file_path}")
            except json.JSONDecodeError:
                print(f"Error decoding JSON from file: {file_path}")
            except Exception as e:
                print(f"Error processing file {file_path}: {str(e)}")


def main():
    importer = DataImporter()
    importer.import_data()


if __name__ == "__main__":
    main()