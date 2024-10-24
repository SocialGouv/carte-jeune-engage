import json
from typing import List


def get_article_names(file_paths: List[str]) -> dict:
    """
    Extraire tous les noms d'articles des fichiers JSON spécifiés
    """
    all_articles = {}

    for file_path in file_paths:
        source_name = file_path.split('/')[-1].split('.')[0]  # Extraire le nom du fichier

        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        article_names = []

        for catalogue in data.get('catalogues', []):
            for cat in catalogue.get('catalogue', []):
                for genre in cat.get('genres', []):
                    for gen in genre.get('genre', []):
                        for sousgenre in gen.get('sousgenres', []):
                            for sg in sousgenre.get('sousgenre', []):
                                for articles in sg.get('articles', []):
                                    for article in articles.get('article', []):
                                        if 'articles_nom' in article:
                                            article_names.append(article['articles_nom'])

        all_articles[source_name] = article_names

    return all_articles
